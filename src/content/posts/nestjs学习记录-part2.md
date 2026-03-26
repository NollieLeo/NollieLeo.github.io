---
title: NestJS 学习记录 Part 2：工程化实践
published: 2026-03-26T12:05:00.000Z
description: >-
  记录 NestJS 项目中的工程化实践：全局响应拦截器、异常过滤器链、ValidationPipe 的配置以及生产环境日志框架 nestjs-pino 的应用。
tags:
  - NestJS
  - TypeScript
  - Backend
category: "后端开发"
---

本文记录在 NestJS 项目中应用的四个工程化实践，探讨其配置原因及替代方案。

---

## 为什么要用响应拦截器统一 API 格式？

为了保持前后端接口格式的一致性（如 `{ code: 0, message: 'success', data: ... }`），通常需要统一封装返回结果。

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: unknown) => ({
        code: 0,
        message: "success",
        // 边界处理：将 undefined 转换为 null，保证前端 JSON 序列化的稳定性
        data: data === undefined ? null : (data as T),
      })),
    );
  }
}
```

### 思考与对比

- **为什么不在 Controller 里手动拼装？**
  手动组装会导致大量模板代码，违反 DRY 原则。且如果结构变更，修改成本较高。
- **为什么使用 RxJS 的 Observable 流？**
  拦截器包装了路由处理器的执行流，借助 `map` 操作符在数据返回给前端前进行拦截与格式化。Controller 只需专注于返回业务数据结构。
- **替代方案：**
  可以在基础控制器（BaseController）中提供统一的包装方法并继承。但在 NestJS 中，使用拦截器（基于切面的设计）比类继承具有更好的解耦性。

---

## 异常过滤器是怎么知道该进哪一个的？

服务端业务通常配置一组层级化的异常过滤器来处理报错。

```typescript
// main.ts
app.useGlobalFilters(
  new AllExceptionFilter(logger, httpAdapterHost), // 范围最大，兜底处理
  new TypeormExceptionFilter(logger), // 针对数据库报错拦截
  new EntityNotFoundExceptionFilter(logger), // 针对特定实体的拦截
);
```

### 思考与对比

- **为什么要设置多个过滤器？**
  全局过滤器的匹配从后往前执行。抛出数据库错误时，会优先被 `TypeormExceptionFilter` 捕获。如果是特定过滤器无法处理的普通 Error，最终会被 `AllExceptionFilter` 兜底，返回统一的 HTTP 500 错误，避免堆栈信息直接暴露。
- **在 TypeormExceptionFilter 拦截底层错误的意义：**
  例如 MySQL 违反唯一约束会抛出 `ER_DUP_ENTRY`。在拦截器中将其转换为 HTTP `409 Conflict`，并返回明确的业务提示信息，比直接返回 500 错误更利于前端联调排错。
- **为什么不在 Service 里全局使用 `try-catch`？**
  在业务层过度使用 `try-catch` 会导致代码臃肿。将错误向上抛出，由全局过滤器统一处理，符合错误统一管理的规范。

---

## ValidationPipe 里的 whitelist 是干什么用的？

通过在应用入口配置全局验证管道处理请求参数验证：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

### 思考与对比

- **开启 `whitelist: true` 的作用：**
  如果没有白名单，前端提交 DTO 类中未定义的字段时，这些额外字段可能会被更新至数据库，引发批量赋值漏洞 (Mass Assignment)。`whitelist` 会自动剔除所有未声明的非法字段。
- **`enableImplicitConversion` 的作用：**
  HTTP 协议中的 Query 字符串和 Path 参数通常被解析为字符串。开启隐式转换后，NestJS 会根据 DTO 的类型定义（如 `number`），自动完成类型转换。避免了手动调用 `parseInt()` 或在每个属性上添加 `@Type(() => Number)` 装饰器。

---

## 为什么不用原生 Logger 要换成 Pino？

在生产环境中，项目中使用了 `nestjs-pino` 替代原生的 `ConsoleLogger`。

### 思考与对比

- **为什么替换原生 Logger？**
  原生 `console.log` 的同步特性在高并发时可能会影响性能。彩色文本日志也不利于使用正则或日志系统解析。
- **Pino 的优势：**
  1. 性能较好，采用异步非阻塞。
  2. 默认输出 JSON 结构化日志，便于直接接入 ELK 或其他日志聚合分析系统。
- **脱敏与切割配置：**
  ```typescript
  redact: ["req.headers.authorization", "req.body.password"];
  ```
  **日志脱敏**：记录请求日志时，`redact` 配置会在落盘前自动将敏感字段替换为 `[Redacted]`，防止密码或 Token 在日志文件中明文留存。
  **日志切割**：使用 `pino-roll` 按天或按文件大小进行切割轮转，避免单个日志文件过大占用过多磁盘空间。
