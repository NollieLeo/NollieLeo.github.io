---
title: NestJS 学习记录 Part 3：业务实践细节
published: 2026-03-26T12:10:00.000Z
description: >-
  记录 NestJS 项目中的具体业务实践：密码加密存储、操作日志的自动化记录以及前端传参的格式清洗。
tags:
  - NestJS
  - TypeScript
  - Backend
category: "后端开发"
---

本文探讨在具体业务开发中，如何通过 NestJS 的机制来处理密码加密、自动化操作日志采集以及数据格式清洗。

---

## 为什么绝对不能明文存储密码？

在 `AuthService` 中，我们使用 `bcryptjs` 处理密码：

```typescript
// 验证密码
const isPasswordValid = await bcrypt.compare(password, user.password);

// 更新密码
const salt = await bcrypt.genSalt(10);
const hashedNewPassword = await bcrypt.hash(dto.newPassword, salt);
```

### 思考与对比

- **为什么不明文存储密码？**
  明文存储密码一旦发生数据库泄露，会导致用户账号信息直接暴露。
- **为什么不使用普通的 MD5 或 SHA-256？**
  MD5 的计算速度较快，容易通过预先计算的哈希字典被反查出原密码。
- **bcrypt 的优势：**
  1. **内置加盐 (Salt)**：`genSalt(10)` 生成随机字符串混入密码进行哈希，保证相同明文密码生成的密文不同，抵御查表攻击。
  2. **可调复杂度**：通过设置成本因子（Cost Factor），增加计算的 CPU 消耗，提高暴力破解的时间成本。
  3. **防时序攻击**：`bcrypt.compare` 的比较时间恒定，防止通过接口响应时长推测密码。

---

## 如何在不侵入业务的情况下记录操作日志？

在后台系统中，通常需要记录操作日志。直接在 Controller 中添加日志记录会导致代码耦合。使用 `OperationLogInterceptor` 可以解决这个问题：

```typescript
return next.handle().pipe(
  tap(() => {
    // 请求成功：记录 HTTP 200 及相关信息
    const statusCode = response.statusCode || HttpStatus.OK;
    this.saveLog({ path, method, data, result: statusCode, ... });
  }),
  catchError((error: unknown) => {
    // 请求失败：记录实际的错误状态码并抛出异常
    const statusCode = error instanceof HttpException ? error.getStatus() : 500;
    this.saveLog({ path, method, data, result: statusCode, ... });
    return throwError(() => error);
  }),
);
```

### 思考与对比

- **设计思路：**
  采用非侵入式设计，通过 `@OperationLog` 装饰器标识接口，拦截器提取元数据并记录日志。业务代码无需关注日志逻辑。
- **`tap` 和 `catchError` 的作用：**
  - `tap` (旁路执行)：在不改变原本返回数据流的情况下执行副作用（保存数据库日志）。
  - `catchError` (错误捕获)：请求抛出异常时，记录失败日志并通过 `throwError` 重新抛出，交由全局异常过滤器处理。
- **日志字段过滤：**
  ```typescript
  const bodyCopy = { ...request.body };
  if ("password" in bodyCopy) bodyCopy.password = "***";
  ```
  保存日志前对 `request.body` 进行拷贝并遮蔽密码字段，防止明文密码被保存至日志表中。

---

## 为什么要在 DTO 里做数据清洗而不是 Service 层？

前端表单传入的数据有时包含多余的空格（例如 `" admin "`）。这会影响后续的验证与查询匹配。在 DTO 中使用自定义转换可以统一处理这类问题：

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

### 思考与对比

- **为什么不在 Service 层进行 trim 操作？**
  在业务逻辑层手动对特定字段进行 `.trim()` 处理容易遗漏，且增加了业务代码的复杂度。
- **设计思路：**
  利用 `class-transformer` 的 `@Transform` 装饰器，在数据进入 Controller 之前（框架的外层边界）完成数据清洗。这样流入后续环节的数据已经是规范的结构，符合防腐层 (Anti-Corruption Layer) 的设计思想。
