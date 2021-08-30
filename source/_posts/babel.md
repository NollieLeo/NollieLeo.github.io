---
title: babel
date: 2021-08-07 10:37:22
tags:
- webpack
categories:
- babel

---



## @babel/plugin-transform-runtime

babel官方提供的一个插件，作用是减少冗余的代码。

例如：

class extend 的语法在转换后会在ES5的代码里头注入_extend辅助函数用于实现继承

这导致每个使用class extend语法的文件都会被注入重复的_extends辅助函数代码

因此这个插件可以将这个注入函数改成require的形式导入语句来减少代码文件大小

需要和babel-runtime结合使用



## babel-loader

https://www.npmjs.com/package/babel-loader

这个包允许使用 Babel 和 webpack 转译 JavaScript 文件。



## @babel/core

Babel 编译器核心。



## @babel/preset-env

https://babel.dev/docs/en/babel-preset-env

@babel/preset-env 是一个智能预设，它允许您使用最新的 JavaScript，而无需对目标环境需要哪些语法转换（以及可选的浏览器 polyfill）进行微观管理。



## @babel/runtime

@babel/runtime 是一个包含 Babel 模块化运行时助手和 regenerator-runtime 版本的库。



## **@babel/eslint-parser** 

ESLint 的默认解析器和核心规则仅支持最新的最终 ECMAScript 标准，不支持 Babel 提供的实验性（如新特性）和非标准（如 Flow 或 TypeScript 类型）语法

@babel/eslint-parser 是一个解析器，它允许 ESLint 在 Babel 转换的源代码上运行。

在**.eslintrc.js**配置

```js
module.exports = {
  parser: "@babel/eslint-parser",
};
```

有些新东西可能还得用上`@babel/eslint-plugin`