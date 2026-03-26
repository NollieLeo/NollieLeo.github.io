---
title: NestJS 学习记录 Part 5：CLI 环境割裂与请求参数陷阱
published: 2026-03-26T12:20:00.000Z
description: >-
  记录 NestJS 项目中的两个常见易错点：为什么 TypeORM CLI 运行迁移时总是读不到环境变量？为什么处理 GET 数组参数时还要手动判断是否为数组？以及如何防御 SQL 注入。
tags:
  - NestJS
  - TypeScript
  - TypeORM
  - Backend
category: "后端开发"
---

本文记录在 NestJS 配合 TypeORM 开发中遇到的两个常见问题：TypeORM CLI 环境导致的环境变量读取问题，以及处理 HTTP GET 请求数组参数时的边界处理。

---

## 为什么 TypeORM CLI 运行迁移时总是读不到环境变量？

在开发环境中，NestJS 应用能正常连接数据库，因为我们在 `AppModule` 中配置了 `ConfigModule.forRoot()` 来加载环境变量。

但在终端执行 `npm run typeorm migration:run` 时，可能会报错：`Access denied for user 'undefined'@'localhost'`。

在专门提供给 TypeORM CLI 使用的 `data-source.ts` 中，必须这样写：

```typescript
// apps/server/src/data-source.ts
import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";

// ⚠️ 必须先加载环境变量，再导入配置
// 因为 CLI 独立运行，不经过 NestJS 的 ConfigModule
const envFilePath = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFilePath });
dotenv.config({ path: ".env" });

// 环境变量加载后，再导入配置
import { getDatabaseConfig } from "./config/database.config";

export default new DataSource({
  ...getDatabaseConfig(),
  synchronize: false, // ⚠️ CLI 永远不应该自动同步
  logging: true,
} as DataSourceOptions);
```

### 思考与对比

- **环境的割裂：**
  `TypeORM CLI` 是一个完全独立的纯 Node.js 脚本环境。执行 CLI 命令时，它不会加载 `app.module.ts` 中的模块。
- **为什么要先 `dotenv` 再 `import` 配置？**
  Node.js 的模块加载是静态的。如果先 `import { getDatabaseConfig }`，此时 `process.env.DB_PASSWORD` 拿到的是 `undefined`。
  因此，必须要在提供给 CLI 的入口文件顶部，手动调用 `dotenv.config()` 将配置注入到 `process.env` 中，然后再 `import` 配置文件，确保配置函数正常获取到环境变量。

---

## 为什么接 GET 数组参数时还要手动 Array.isArray 判断？

在实现“行政区划回显”（根据传入的几个 `code` 查询对应的省市区名字）时，Controller 中的参数接收逻辑如下：

```typescript
// apps/server/src/region/region.controller.ts
@Get()
findAll(@Query('codes') codes?: string | string[]) {
  if (codes) {
    // 抹平单参数和多参数的差异
    const codesArray = Array.isArray(codes) ? codes : [codes];
    return this.regionService.getRegionsByCodes(codesArray);
  }
  return this.regionService.getProvinces();
}
```

Service 中的查询逻辑如下：

```typescript
// apps/server/src/region/region.service.ts
async getRegionsByCodes(codes: string[]) {
  if (!codes || codes.length === 0) return [];

  // TypeORM 的 In 查询可以直接用 array
  const qb = this.regionRepository
    .createQueryBuilder('region')
    .where('region.code IN (:...codes)', { codes });

  return qb.getMany();
}
```

### 思考与对比

- **为什么需要判断数组？**
  在 HTTP 协议中：
  - 如果请求 `/regions?codes=110000`，后端拿到的 `codes` 是**字符串** (`"110000"`)。
  - 如果请求 `/regions?codes=110000&codes=120000`，后端拿到的 `codes` 是**数组** (`["110000", "120000"]`)。
    如果后端直接调用 `codes.map()` 或传给 TypeORM，遇到单一参数时会报 `.map is not a function` 错误。`Array.isArray(codes) ? codes : [codes]` 统一了边界情况，将其统一转为了数组。
- **`IN (:...codes)` 的作用与防注入：**
  当把数组传入 SQL 的 `IN` 语句时，原生字符串拼接易引发 SQL 注入。TypeORM 的 `:...codes` 展开语法会在底层进行参数化绑定（Parameterized Queries），避免了 SQL 注入的风险。
