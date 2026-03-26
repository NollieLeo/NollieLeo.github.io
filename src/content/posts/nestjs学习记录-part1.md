---
title: NestJS 学习记录 Part 1：核心原理解析
published: 2026-03-26T12:00:00.000Z
description: >-
  记录在学习 NestJS 时遇到的核心概念解析：身份验证流、装饰器执行顺序、跨平台执行上下文，以及元数据反射机制。探讨其设计原因及替代方案。
tags:
  - NestJS
  - TypeScript
  - Backend
category: "后端开发"
---

## 为什么能在 request 中拿到 user 呢？

在实现 `RolesGuard` 时，常常需要在 `request` 对象中获取 `user` 对象：

```typescript
// RolesGuard 示例代码
const request = context
  .switchToHttp()
  .getRequest<{ user?: { roles?: string[] } }>();
const user = request.user;
```

这实际上是由 NestJS 和 Passport.js 构筑的身份验证流水线完成的。

1. **拦截请求**：`JwtAuthGuard` 率先拦截请求，提取 `Authorization` 头的 Token。
2. **验证与解析**：底层触发 `JwtStrategy` 的 `validate` 方法。
3. **挂载上下文**：Passport 验证成功后，自动将解析出的对象赋值给 `request.user`。
4. **权限校验**：后续的 `RolesGuard` 从 `request.user` 提取身份信息进行鉴权。

### 思考与对比

- **为什么这么做？**
  基于“关注点分离”原则。身份验证（解析 Token）和授权控制（校验权限）分离。将解析 Token 抽离到 Strategy 中，`Guard` 保持轻量和复用。
- **如果在 Controller 里直接解析 Token 会怎样？**
  会导致代码冗余。每个需要鉴权的接口都要写解码 Token 的逻辑，业务与鉴权强耦合，后续重构成本高。
- **与传统 Middleware 相比的好处：**
  传统 Express 中间件对应用级上下文缺乏感知。在 NestJS 中，`Guard` 能够访问到 `ExecutionContext`，知道接下来要执行哪个 Controller 和 Method，从而支持基于元数据的细粒度鉴权（如 `@Roles`）。

---

## 装饰器到底是按照什么顺序执行的？

控制器上经常会有多个装饰器，它们的执行顺序如下：

```typescript
@ApiTags("用户管理 (Admin)") // 5. 最后执行
@ApiBearerAuth() // 4. 第四个执行
@UseGuards(JwtAuthGuard, RolesGuard) // 3. 第三个执行
@Roles(RoleEnum.ADMIN) // 2. 第二个执行
@Controller("user") // 1. 最先执行
export class UserController {}
```

### 思考与对比

- **代码加载阶段**遵循 TypeScript 规范，采用洋葱模型**从下往上**执行。此时，装饰器并不执行业务逻辑，仅调用 `Reflect.defineMetadata` 添加元数据。
- **运行时阶段**由 NestJS 框架接管请求的生命周期。比如 `@UseGuards(JwtAuthGuard, RolesGuard)` 内部是**从左到右**依次执行，因为存在依赖关系（先登录，后鉴权）。像 `@ApiTags` 仅在应用启动扫描 Swagger 时生效。
- **这种设计的好处**是声明式编程。开发者通过装饰器声明接口属性和权限，而非编写大量的 `if-else` 判断逻辑，提高了代码的直观性。

---

## switchToHttp() 到底是干嘛用的？

在编写 Guard 或 Interceptor 时，NestJS 提供的是 `context: ExecutionContext`。

```typescript
const request = context.switchToHttp().getRequest();
```

### 思考与对比

- **为什么这么设计？**
  NestJS 是一个与传输层无关的框架。同一套业务代码可以支撑 HTTP、WebSockets、微服务 (TCP/gRPC) 等。
- **为什么要 `switchToHttp()`？**
  NestJS 通过 `ExecutionContext` 将底层协议统一。调用 `switchToHttp()` 明确获取 HTTP 上下文。如果增加 WebSocket 模块，只需改为 `context.switchToWs()`，即可复用守卫逻辑。
- **避免直接注入 `@Req()`**：
  大量依赖 `express` 的原生请求对象，会导致代码和 HTTP 协议深度绑定，降低后续向微服务架构演进的灵活性。

---

## getAllAndOverride 和 getAllAndMerge 有啥区别？

在 NestJS 中，装饰器既可以修饰类（Controller），也可以修饰方法（Route Handler）。当两者冲突或需要叠加时，`Reflector` 提供了两种核心策略。

### 思考与对比

- **`getAllAndOverride` (覆盖优先)**：

  ```typescript
  const roles = this.reflector.getAllAndOverride<RoleEnum[]>("roles", [
    context.getHandler(), // 方法优先级高
    context.getClass(), // 类优先级低
  ]);
  ```

  **适用场景**：局部特例。例如整个 `UserController` 默认需要 `ADMIN`，但某个特定接口允许 `USER` 访问。方法级配置覆盖类级配置。

- **`getAllAndMerge` (合并累加)**：
  ```typescript
  const roles = this.reflector.getAllAndMerge<RoleEnum[]>("roles", [
    context.getHandler(),
    context.getClass(),
  ]);
  ```
  **适用场景**：多重限制叠加。整个模块要求 `ADMIN`，而某个接口贴了 `SUPER_ADMIN`，合并后要求同时具备 `['ADMIN', 'SUPER_ADMIN']`，全部满足才能放行。
