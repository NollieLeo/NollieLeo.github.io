---
title: 常用plugins
date: 2021-08-05 21:40:40
tags:
- webpack
categories:
- plugins

---



## CSS

### mini-css-extract-plugin

[mini-csss-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)

这个插件将 CSS 提取到单独的文件中。它为每个包含 CSS 的 JS 文件创建一个 CSS 文件。它支持按需加载 CSS 和 SourceMaps。

它建立在新的 webpack v5 功能之上，并且需要 webpack 5 才能工作。

提供了一个loader，通过`MiniCsseExtractPlugin.loader`配置loader使用

> 有时候我们会摒弃style-loader的代码去发布线上代码，直接用这个插件的原因是因为 [css-separating](https://survivejs.com/webpack/styling/separating-css/)
>
> css抽离成文件可以，让js和css并行加载，提前解析css



###  postcss-preset-env 

[postcss-preset-env](https://www.npmjs.com/package/postcss-preset-env)

PostCSS Preset Env 允许您将现代 CSS 转换为大多数浏览器可以理解的内容，根据您的目标浏览器或运行时环境确定您需要的 polyfill。



###  autoprefixer 

PostCSS 插件，用于解析 CSS 并使用 Can I Use 中的值向 CSS 规则添加供应商前缀。它由 Google 推荐并用于 Twitter 和阿里巴巴。

Autoprefixer 将使用基于当前浏览器流行度和属性支持的数据为您应用前缀

列如：在`postcss.config.js`中

```js
module.exports = {
  plugins: [
    [
      require("autoprefixer")({
        overrideBrowserslist: [
          "last 2 versions",
          "Firefox ESR",
          "> 1%",
          "ie >= 8",
          "iOS >= 8",
          "Android >= 4",
        ],
      })
    ],
  ],
};

```

当然在webpack中也需要配置postcss-loader这个loader是执行所有postcss的插件的关键loader





## html

### HtmlWebpackPlugin

https://www.npmjs.com/package/html-webpack-plugin

这是一个 webpack 插件，它简化了 HTML 文件的创建以服务于你的 webpack 包。这对于在文件名中包含哈希值的 webpack 包特别有用，该哈希值会更改每次编译。

您可以让插件为您生成 HTML 文件，使用 lodash 模板提供您自己的模板或使用您自己的加载器。





## js

###  terser-webpack-plugin 

使用该插件来压缩js的代码

如果你使用的是 webpack v5 或以上版本，你不需要安装这个插件。webpack v5 自带最新的 `terser-webpack-plugin`。如果使用 webpack v4，则必须安装 `terser-webpack-plugin` v4 的版本。





## 打包分析相关

###  webpack-bundle-analyzer 

https://www.npmjs.com/package/webpack-bundle-analyzer

webpack-bundle-analyzer 是打包分析神器，可以看到每个包的大小，以及是否有包被重复打包。



###  speed-measure-webpack-plugin 

https://www.npmjs.com/package/speed-measure-webpack-plugin

 这个插件帮助我们分析整个打包的总耗时，以及每一个loader 和每一个 plugins 构建所耗费的时间，从而帮助我们快速定位到可以优化 Webpack 的配置。 





## 代码检查

代码检测肯定不当当针对于代码的，我们可以在装了如下的几个plugin之后可以基于git为项目接入git hook，这里推荐使用husky来进行提交前的代码检测 [husky](https://typicode.github.io/husky/#/)

### eslint-webpack-plugin

https://www.npmjs.com/package/eslint-webpack-plugin

针对于js的代码进行代码检测，使用 eslint 来查找和修复 JavaScript 代码中的问题	

当然用这个之前肯定是要装eslint的

> 通常react的项目需要结合`eslint-config-airbnb`， ` eslint-plugin-import `,  ` eslint-plugin-react `, ` eslint-plugin-react-hooks `, ` eslint-plugin-jsx-a11y `,

> 当然你可以结合husky为commit之前提供lint指令hooks，然后使用lint-staged提供运行时候的lint





### stylelint

https://github.com/stylelint/stylelint/blob/HEAD/docs/user-guide/get-started.md

这玩意基于postCss, 能检查任何PostCss能解析的代码

