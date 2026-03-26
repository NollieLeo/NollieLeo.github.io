---
title: nestjs学习记录 part3：安全、AOP日志与自定义校验
published: 2026-03-26T12:10:00.000Z
description: >-
  深度拆解 NestJS 项目中的高级最佳实践：为什么不用明文存密码？如何利用 RxJS 的 tap 和 catchError 在拦截器中优雅地实现不侵入业务的操作日志记录？以及如何使用 class-transformer 在数据边界清洗“脏数据”。
tags:
  - NestJS
  - TypeScript
  - Backend
  - 安全
category: "后端开发"
---

在之前的文章中，我们讨论了拦截器、异常过滤、全局管道等宏观层面的工程化配置。本文我们将视野拉近，看看在具体的业务开发中，如何通过 NestJS 的机制来处理**密码安全**、**自动化日志采集**以及**脏数据清洗**。

---

## 1. 密码安全与单向散列算法 (bcrypt)

在 `AuthService` 的登录与密码修改逻辑中，我们使用了 `bcryptjs` 来处理密码：

```typescript
// 验证密码
const isPasswordValid = await bcrypt.compare(password, user.password);

// 更新密码
const salt = await bcrypt.genSalt(10);
const hashedNewPassword = await bcrypt.hash(dto.newPassword, salt);
```

### 💡 深度思考：

- **为什么绝对不能明文存储密码？**
  如果数据库被拖库（泄露），所有用户的账号密码将直接暴露。由于许多用户在不同网站使用相同的密码，这会导致极其严重的“撞库”安全事故。
- **为什么不用普通的 MD5 或 SHA-256？**
  MD5 虽然是单向散列，但它的计算速度太快了。黑客可以通过**彩虹表**（预先计算好的哈希字典）在极短时间内反查出原密码。
- **bcrypt 的优势在哪里？**
  1. **内置加盐 (Salt)**：`genSalt(10)` 会生成随机字符串混入密码中再进行哈希。这意味着即使两个用户的密码都是 `123456`，在数据库里存的密文也完全不同，彻底防住了彩虹表。
  2. **自适应的慢速算法**：参数 `10`（Cost Factor）决定了计算的复杂度。它故意消耗 CPU 资源，使得暴力破解的成本呈指数级上升。
  3. **防时序攻击**：`bcrypt.compare` 在比较密码时消耗的时间是恒定的，黑客无法通过接口响应时间的长短来推测密码的正确字符。

---

## 2. 基于 AOP 的操作日志记录 (RxJS 的魔法)

在一个企业后台系统中，“谁、在什么时间、做了什么操作、成功与否”是必须记录的审计日志。如果将打日志的代码写在每个 Controller 里，代码将极其难看。

为此，我们实现了 `OperationLogInterceptor`：

```typescript
return next.handle().pipe(
  tap(() => {
    // 请求成功：执行这里的逻辑，记录 HTTP 200
    const statusCode = response.statusCode || HttpStatus.OK;
    this.saveLog({ path, method, data, result: statusCode, ... });
  }),
  catchError((error: unknown) => {
    // 请求失败：拦截异常，记录真实的失败状态码，然后再将异常抛回给框架
    const statusCode = error instanceof HttpException ? error.getStatus() : 500;
    this.saveLog({ path, method, data, result: statusCode, ... });
    return throwError(() => error);
  }),
);
```

### 💡 深度思考：

- **为什么这么做？**
  完美的**非侵入式设计**。给 Controller 贴一个 `@OperationLog('创建用户')` 的装饰器，拦截器利用反射 (`Reflector`) 自动提取该元数据，并在请求流转结束后悄悄把日志存入数据库。业务代码对日志系统“毫无察觉”。
- **`tap` 和 `catchError` 的作用是什么？**
  NestJS 拦截器是基于 RxJS 的。
  - `tap` (旁路执行)：它允许你“偷窥”数据流，执行一些副作用（比如存数据库），但**绝对不会改变或阻断**原本要返回给前端的数据。
  - `catchError` (错误捕获)：如果请求抛出异常（如权限不足 403），`tap` 是不会触发的。此时流会进入 `catchError`，我们在这里记录下失败的日志，然后通过 `throwError` 重新把异常抛出，让外层的**异常过滤器 (Exception Filter)** 继续接管。
- **日志脱敏的细节：**
  ```typescript
  const bodyCopy = { ...request.body };
  if ("password" in bodyCopy) bodyCopy.password = "***";
  ```
  操作日志是写在数据库里供管理员查看的，如果直接把 `request.body` 字符串化，前端传来的明文密码就会被直接看到。这一步简单的字段遮罩（Masking）是合规和安全的底线。

---

## 3. 自定义数据转换：在边界清洗“脏数据”

用户在前端表单输入数据时，常常会不小心在开头或结尾多敲了空格，比如 `" admin "`。如果直接存入数据库，会导致后续的登录和查询匹配失败。

我们在 DTO 中使用了自定义转换：

```typescript
// transformer.util.ts
export const trimString = ({ value }: TransformFnParams): unknown => {
  return typeof value === 'string' ? value.trim() : value;
};

// DTO 里的应用
@Transform(trimString)
@IsString()
username: string;
```

### 💡 深度思考：

- **为什么不在 Service 层进行 trim 操作？**
  如果在 `UserService` 里写 `const username = dto.username.trim()`，不仅代码啰嗦，而且很容易漏掉。更糟糕的是，业务逻辑层被“脏数据处理”这种琐碎的逻辑污染了。
- **为什么这么做最好？**
  利用 `class-transformer` 的 `@Transform` 装饰器，我们在系统的**最外层边界 (Boundary)** 就完成了数据的清洗。当数据流入 Controller 和 Service 时，它已经是一个完全干净、合法的结构了。
- **这是什么架构思想？**
  这是典型的**防腐层 (Anti-Corruption Layer)** 思想的微观体现。坚决不让框架外部的脏数据、不规范数据进入到核心的领域模型（业务代码）中去。
