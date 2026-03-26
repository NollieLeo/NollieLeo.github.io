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

在 `AuthService` 中，我们使用 `bcryptjs` 单向散列算法处理密码。不论是用户登录验证还是密码修改，都不会接触到密码的明文：

```typescript
// apps/server/src/auth/auth.service.ts
@Injectable()
export class AuthService {
  // 验证密码
  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username, true);
    // ...
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new BadRequestException("用户名或密码错误");
    return user;
  }

  // 修改密码
  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    // ...
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(dto.newPassword, salt);
    await this.userService.updatePasswordRaw(userId, hashedNewPassword);
    return { success: true };
  }
}
```

### 思考与对比

- **为什么不明文存储密码？**
  明文存储密码一旦发生数据库泄露，会导致用户账号信息直接暴露（甚至引发跨站点的“撞库”安全事故）。
- **为什么不使用普通的 MD5 或 SHA-256？**
  MD5 的计算速度较快，黑客容易通过预先计算的彩虹表哈希字典反查出原密码。
- **bcrypt 的优势：**
  1. **内置加盐 (Salt)**：`genSalt(10)` 生成随机字符串混入密码进行哈希，保证相同明文密码生成的密文也截然不同，抵御查表攻击。
  2. **可调复杂度**：通过设置成本因子，增加计算的 CPU 消耗，大幅提高暴力破解的时间成本。
  3. **防时序攻击**：`bcrypt.compare` 的比较时间是恒定的，防止通过接口响应时长推测密码。

---

## 如何在不侵入业务的情况下记录操作日志？

在后台系统中，通常需要审计操作日志。如果直接在每个 Controller 里添加 `this.logsService.create(...)` 会导致代码深度耦合。为此，我们使用了 `OperationLogInterceptor`：

```typescript
// apps/server/src/interceptors/operation-log.interceptor.ts
@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  // ...
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<OperationLogMetadata>(
      OPERATION_LOG_KEY,
      context.getHandler(),
    );
    if (!metadata) return next.handle();

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // 简单脱敏
    const bodyCopy = { ...request.body };
    if ("password" in bodyCopy) bodyCopy.password = "***";
    const data = JSON.stringify(bodyCopy);

    return next.handle().pipe(
      tap(() => {
        // 请求成功：记录 HTTP 200 及相关信息
        const statusCode = response.statusCode || HttpStatus.OK;
        this.saveLog({
          path: request.path,
          method: request.method,
          data,
          result: statusCode,
          userId: request.user?.id,
          description: metadata.description,
        });
      }),
      catchError((error: unknown) => {
        // 请求失败：记录实际的错误状态码并抛出异常
        const statusCode =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        this.saveLog({
          path: request.path,
          method: request.method,
          data,
          result: statusCode,
          userId: request.user?.id,
          description: metadata.description,
        });
        return throwError(() => error);
      }),
    );
  }
}
```

### 思考与对比

- **设计思路：**
  采用非侵入式设计，只要在接口上贴 `@OperationLog('创建新用户')`，拦截器就会自动提取元数据并打日志。业务代码完全无感。
- **`tap` 和 `catchError` 的作用：**
  - `tap` (旁路执行)：在不改变原本返回数据流的情况下，记录数据库日志。
  - `catchError` (错误捕获)：哪怕业务层抛出异常，拦截器也能记录失败日志，然后通过 `throwError` 重新抛出，不阻断全局异常过滤器。

---

## 为什么要在 DTO 里做数据清洗而不是 Service 层？

用户在前端表单输入时，经常会多敲空格（如 `" admin "`）。这会严重影响后续的匹配与查询。我们在 DTO 中使用 `class-transformer` 的 `@Transform` 来处理这类问题：

```typescript
// apps/server/src/utils/transformer.util.ts
import { TransformFnParams } from "class-transformer";

export const trimString = ({ value }: TransformFnParams): unknown => {
  return typeof value === "string" ? value.trim() : value;
};
```

然后在入参校验 DTO 中使用：

```typescript
// apps/server/src/user/dto/create-user.dto.ts
export class CreateUserDto implements RegisterRequest {
  @IsString()
  @IsNotEmpty()
  @Transform(trimString)
  username: string;
  // ...
}
```

### 思考与对比

- **为什么不在 Service 层进行 trim 操作？**
  在业务逻辑层（如 `UserService`）手动对特定字段进行 `.trim()` 处理，不仅代码啰嗦容易遗漏，还会使核心业务代码被“清洗脏数据”这种边缘逻辑污染。
- **设计思路：**
  在数据进入 Controller 之前（即框架的最外层边界），利用管道与 DTO 转换直接完成数据清洗。流入系统内部的数据将永远是干净的。这完美契合了系统架构设计中的**防腐层 (Anti-Corruption Layer)** 思想。
