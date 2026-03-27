---
title: NestJS 学习记录 Part 7：TypeORM 级联保存与 Monorepo 全栈类型共享
published: 2026-03-26T12:30:00.000Z
description: >-
  探讨在实际全栈项目中的两个高级架构设计：TypeORM 中的级联保存 (Cascade) 如何消除繁琐的事务与时序问题，以及在 Monorepo 架构下，如何通过全栈类型共享实现前后端规则的“Single Source of Truth”。
tags:
  - NestJS
  - React
  - TypeORM
  - Monorepo
category: "全栈开发"
---

在前后端协同和数据库关系设计的深水区，我们经常会遇到数据时序同步和前后端校验规则不一致的痛点。本文将探讨项目中采用的两个高级解法：TypeORM 的级联保存（Cascade）以及基于 Monorepo 的全栈类型与常量共享。

---

## 1. TypeORM 级联保存：告别繁琐的关联插入

在项目中，一个 `User`（用户主表）通常会关联一个 `Profile`（用户详情资料表）。

按照传统思维，如果我们要在注册时同时插入用户和资料，我们需要写如下的繁琐代码（甚至还需要包一层数据库事务来保证原子性）：

```typescript
// 传统写法的噩梦
const user = this.userRepo.create({ username, password });
const savedUser = await this.userRepo.save(user);

const profile = this.profileRepo.create({
  userId: savedUser.id,
  avatar,
  gender,
});
await this.profileRepo.save(profile);
```

而在我们的代码中，创建逻辑被简化到了极致，只需要 `this.userRepository.save(newUser)` 一行代码。这一切归功于在实体类中配置的 `cascade: true`。

```typescript
// apps/server/src/user/user.entity.ts
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // 这里的 { cascade: true } 是魔法的核心
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;
}
```

### 思考与对比

- **`cascade: true` 到底做了什么？**
  级联操作告诉 TypeORM：“当我对主表（User）执行 Save 操作时，如果它的 `profile` 属性里也塞了数据，请自动帮我先插入主表，拿到主键 ID 后，再自动帮我把它关联的子表（Profile）也一并插入数据库中。”
  它在底层自动处理了外键的时序依赖问题，并且将整个过程隐式地包裹在了同一个数据库事务中。
- **这种设计的优势：**
  大幅减少了 Service 层的模板代码，避免了手动开启 `QueryRunner` 管理事务的复杂性，将数据持久化的时序职责完美交给了 ORM 框架。

---

## 2. Monorepo 架构：前后端校验规则的 Single Source of Truth

在全栈开发中，最痛苦的事情莫过于**“规则的脱节”**。
比如：产品经理要求用户名最大长度从 10 改到 20。如果采用传统的双仓分离架构，你需要：

1. 改前端：找到注册表单和修改资料表单，修改 Input 组件的 `maxLength` 和表单正则。
2. 改后端：找到 DTO，修改 `class-validator` 里的 `@Length(1, 20)`。
3. 改数据库：修改 TypeORM 实体类，把 `@Column({ length: 20 })` 改掉，并生成迁移脚本。

一旦漏掉某一个环节，就会引发极其诡异的拦截 Bug 或数据库截断报错。

在我们的项目中，采用了 **Monorepo（单体仓库）** 架构，将所有复用的类型与常量抽离到了 `packages/shared` 包中。

```typescript
// packages/shared/src/user.ts
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
```

后端 DTO 和实体类直接引用这个常量：

```typescript
// apps/server/src/user/dto/create-user.dto.ts
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from "@nestjs-learning/shared";

export class CreateUserDto {
  @Length(USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, {
    message: `用户名长度必须在 ${USERNAME_MIN_LENGTH} 到 ${USERNAME_MAX_LENGTH} 个字符之间`,
  })
  username: string;
}
```

而前端 React 的表单组件，同样 `import` 了这个完全相同的常量：

```tsx
// apps/web/src/pages/UserManagement/components/UserModal.tsx
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from "@nestjs-learning/shared";

<Form.Item
  name="username"
  rules={[
    { required: true, message: "请输入用户名" },
    {
      min: USERNAME_MIN_LENGTH,
      max: USERNAME_MAX_LENGTH,
      message: `用户名长度必须在 ${USERNAME_MIN_LENGTH} 到 ${USERNAME_MAX_LENGTH} 个字符之间`,
    },
  ]}
>
  <Input
    placeholder={`请输入${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH}位用户名`}
    maxLength={USERNAME_MAX_LENGTH}
  />
</Form.Item>;
```

### 思考与对比

- **Single Source of Truth (唯一事实来源)：**
  通过 Monorepo 架构共享变量，前后端对同一事物的认知被强行统一。以后无论业务规则如何调整，只需要修改 `packages/shared` 里的一行代码，TypeScript 的全栈编译检查就会自动确保前端的输入限制、后端的 DTO 校验、数据库的列长限制三者永远保持 100% 一致。
- **接口定义的共享：**
  不仅是常量，前后端的请求和响应类型（如 `CreateUserRequest`）同样由 `shared` 包统一定义。这彻底消灭了前端瞎猜字段、后端乱改字段导致的“接口联调地狱”。
