---
title: NestJS 学习记录 Part 5：CLI 环境割裂与请求参数陷阱
published: 2026-03-26T12:20:00.000Z
description: >-
  记录 NestJS 项目中的两个高频易错点：为什么 TypeORM CLI 运行迁移时总是读不到环境变量？为什么处理 GET 数组参数时还要手动判断是否为数组？以及如何防御 SQL 注入。
tags:
  - NestJS
  - TypeScript
  - TypeORM
  - Backend
category: "后端开发"
---

本文记录在 NestJS 配合 TypeORM 开发中遇到的两个高频易错点：TypeORM CLI 环境割裂导致的环境变量丢失，以及处理 HTTP GET 请求数组参数时的边界陷阱。

---

## 为什么 TypeORM CLI 运行迁移时总是读不到环境变量？

在开发环境中，我们的 NestJS 应用能完美连接数据库，因为我们在 `AppModule` 中配置了 `ConfigModule.forRoot()` 来加载环境变量。

但是，当你兴奋地在终端敲下 `npm run typeorm migration:run` 时，它却无情地报错告诉你：`Access denied for user 'undefined'@'localhost'`。

这到底是怎么回事？

在项目专门提供给 TypeORM CLI 使用的 `data-source.ts` 中，我们必须这样写：

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
  `TypeORM CLI` 是一个完全独立的纯 Node.js 脚本环境。当你执行 CLI 命令时，它根本不会去启动、更不会去解析你写在 `app.module.ts` 里的那些模块。
- **为什么要先 `dotenv` 再 `import` 配置？**
  Node.js 的模块加载是静态的、且从上到下执行的。如果你先 `import { getDatabaseConfig }`，在那个文件里 `process.env.DB_PASSWORD` 就已经被求值了，此时它拿到的是 `undefined`。
  因此，你必须要在提供给 CLI 的入口文件最顶部，手动调用 `dotenv.config()` 来将文件中的配置注入到 `process.env` 中，然后再去 `import` 你的配置文件，才能让配置函数正常拿到账号密码。

---

## 为什么接 GET 数组参数时还要手动 Array.isArray 判断？

在实现“行政区划回显”（根据传入的几个 `code` 查询对应的省市区名字）时，我们在 Controller 里是这样接参数的：

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

紧接着在 Service 中进行查询：

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

- **为什么会有单/双的问题？**
  在标准 HTTP 协议里：
  - 如果前端请求 `/regions?codes=110000`，后端拿到的 `codes` 是个**字符串** (`"110000"`)。
  - 如果前端请求 `/regions?codes=110000&codes=120000`，后端拿到的 `codes` 会突然变成一个**数组** (`["110000", "120000"]`)。
    如果后端盲目地调用 `codes.map()` 或直接当数组传给 TypeORM，遇到单一参数时就会报 `.map is not a function` 导致 500 崩溃。`Array.isArray(codes) ? codes : [codes]` 这段代码完美地抹平了这个边界情况，将任何情况都统一转为了数组。
- **`IN (:...codes)` 的精妙设计与防注入：**
  当把数组塞给 SQL 的 `IN` 语句时，如果是原生的字符串拼接，极易引发 SQL 注入。TypeORM 提供了 `:...codes` 的展开语法，它不仅能自动把数组展开为 `IN ('110000', '120000')`，更重要的是它能在底层进行参数化绑定（Parameterized Queries），直接粉碎了通过此接口进行 SQL 注入的可能性。
