---
title: NestJS 学习记录 Part 4：TypeORM 避坑与配置安全
published: 2026-02-01T12:15:00.000Z
description: >-
  记录 NestJS 项目中的 TypeORM 查询踩坑经验与环境配置安全：多对多级联查询数据的过滤丢失问题、密码字段的按需查询（select: false），以及通过 Joi 实现 Fail-Fast 的启动级环境变量校验。
tags:
  - NestJS
  - TypeScript
  - TypeORM
  - Backend
category: "后端开发"
---

本文记录在 NestJS 配合 TypeORM 开发中遇到的数据库查询坑点，以及在应用启动阶段如何保障环境配置的安全与健壮性。

---

## TypeORM 多对多查询过滤为什么会丢数据？

在获取用户列表并支持“按角色过滤”时，初学者很容易写出这样的代码：

```typescript
// 错误写法 ❌
const queryBuilder = this.userRepository
  .createQueryBuilder("user")
  .leftJoinAndSelect("user.roles", "roles")
  .where("roles.id = :roleId", { roleId: role });
```

上述写法隐藏了一个极大的坑：假设一个用户同时拥有 `Admin` 和 `Developer` 两个角色，当你传入 `Developer` 的 roleId 进行过滤时，查出来的这个用户，他的 `roles` 数组里**只剩下了 Developer 角色**，而 Admin 角色被过滤掉了！这会导致返回给前端的用户数据不完整。

为了解决这个问题，我们在 `UserService` 中引入了 **“innerJoin 替身”** 技巧：

```typescript
// apps/server/src/user/user.service.ts
const queryBuilder = this.userRepository
  .createQueryBuilder("user")
  .leftJoinAndSelect("user.roles", "roles"); // 负责把用户的完整角色数据带出来

if (role) {
  // ⚠️ 不要使用 .andWhere('roles.id = :roleId')！
  // 正确做法：新建一个无副作用的 innerJoin 替身 'roleFilter' 专门用来筛选主表，而不影响 SELECT 的 'roles' 数据。
  queryBuilder.innerJoin(
    "user.roles",
    "roleFilter",
    "roleFilter.id = :roleId",
    { roleId: role },
  );
}
```

### 思考与对比

- **为什么会丢数据？**
  `leftJoinAndSelect` 在底层不仅做了连表，还负责构造返回的实体对象树。当你对其别名（`roles`）加上 `where` 条件时，TypeORM 构造对象树时就会直接丢弃不符合条件的关联数据。
- **替身方案的优势：**
  我们新建了一个纯用于连接筛选的别名 `roleFilter`，用它来进行内连接（`innerJoin`）来决定主表 `user` 哪条记录该留下，而原本用于 Select 返回的别名 `roles` 不受任何影响，从而保证了用户拥有多少个角色，返回的数据里就有多少个角色。

---

## 为什么在查询用户时还要单独 addSelect 密码？

在 `UserService` 的登录查询方法中，有一段特殊的逻辑：

```typescript
// apps/server/src/user/user.service.ts
findByUsername(username: string, selectPassword = false) {
  const qb = this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.roles', 'roles')
    .where('user.username = :username', { username });

  if (selectPassword) {
    qb.addSelect('user.password');
  }

  return qb.getOne();
}
```

### 思考与对比

- **为什么查密码要这么费劲？**
  在定义 `User` 实体类时，我们通常会将密码字段配置为 `@Column({ select: false })`。这意味着在普通的查询（如获取用户列表、查询详情）中，数据库引擎**绝对不会**把密码字段 select 出来。这从根源上杜绝了因为开发人员疏忽导致密码被意外序列化并返回给前端的风险。
- **按需取出的安全策略：**
  只有在登录校验或修改密码这种明确需要读取密码哈希值的高危操作中，我们才显式地传入 `selectPassword = true`，并通过 `addSelect('user.password')` 将其临时从数据库取出。这是一种非常极致且有效的安全兜底设计。

---

## 为什么环境变量不能直接用 process.env 读取？

在启动 NestJS 应用时，我们引入了 `@nestjs/config` 并结合 `Joi` 进行了强校验：

```typescript
// apps/server/src/app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.valid("development", "production").default("development"),
    DB_PORT: Joi.number().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
  }),
});
```

### 思考与对比

- **如果不用 Joi 校验会怎样？**
  如果新部署的一台服务器在 `.env` 文件中漏配了 `JWT_SECRET`，而代码里又直接通过 `process.env.JWT_SECRET` 读取。应用在启动时**不会报错**，依然会正常提供服务。直到有用户尝试登录，系统调用签名算法时才会突然崩溃。这给运维排查带来了极大的心智负担。
- **Fail-Fast (快速失败) 架构思想：**
  配置了 `Joi` 校验后，一旦缺失核心的环境变量，NestJS 在服务**启动的瞬间**就会直接报错并阻断运行，清晰地在控制台告诉你少了哪些配置项。这种“有错及早报错”的设计，避免了带着隐患上线的“毒应用”。
