---
title: vite学习记录
date: 2022-11-03 10:37:51
tags:
- Vite
categories:
- Vite
---

# vite前置知识

- `no-bundle`：利用浏览器原生 ES 模块的支持，实现开发阶段的 Dev Server，进行模块的按需加载，而不是先整体打包再进行加载。
- `import`：vite中的一个 import 语句代表一个 HTTP 请求

# 初始化模板

> 这里我们采用pnpm和vite，当然需要全局安装一下。
> 学习记录中使用的是react + ts技术栈

```shell
pnpm create vite
```

初始化之后的文件格式是

```
├── index.html
├── package.json
├── pnpm-lock.yaml
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── favicon.svg
│   ├── index.css
│   ├── logo.svg
│   ├── main.tsx
│   └── vite-env.d.ts
├── tsconfig.json
└── vite.config.ts
```

- index.html：入口文件，vite会默认把根目录下的index.html作为打包入口
  
  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vite + React + TS</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>
  ```
  
  这段代码代表了我们脚本文件的入口，使用type="module"的ES模块加载的模式，当我们访问项目的时候会去通过本地的去请求main.tsx文件
  
  ```html
  <script type="module" src="/src/main.tsx"></script>
  ```
- main.tsx: 入口文件引用的脚本文件

## 修改入口文件位置

> 一般来说项目的入口文件，可能随着项目的变化而改动

例如我们将入口文件改到 src的根下；

要注意两个点：

- 相对路径
- path包要注意ts类型报错
  1. 你需要通过 `pnpm i @types/node -D` 安装类型
  2. tsconfig.node.json 中设置 `allowSyntheticDefaultImports: true`，以允许下面的 default 导入方式

// vite.config.ts

```ts
// vite.config.ts
import { defineConfig } from 'vite'
// 引入 path 包注意两点:
// 1. 为避免类型报错，你需要通过 `pnpm i @types/node -D` 安装类型
// 2. tsconfig.node.json 中设置 `allowSyntheticDefaultImports: true`，以允许下面的 default 导入方式
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 手动指定项目根目录位置
  root: path.join(__dirname, 'src')
  plugins: [react()]
})
```

// tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    // 以允许 node相关的默认 导入方式
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

## 默认指令

```json
"scripts": {
  // 开发阶段启动 Vite Dev Server
  "dev": "vite",
  // 生产环境打包
  "build": "tsc && vite build",
  // 生产环境打包完预览产物
  "preview": "vite preview"
},
```

- "dev": 通过启动vite的Dev Server，在开发阶段实现不打包的特性

- "build": 因为当前初始化模板选用的是ts，所以在真正的使用vite打生产包的时候，要编译 TypeScript 代码并进行类型检查
  
  - 此从用到的时候tsc，是TypeScript 的官方编译命令。在tsconfig.ts文件中其实有这样的配置
    
    ```ts
    {
        "compilerOptions": {
            // 省略其他配置
            // 1. noEmit 表示只做类型检查，而不会输出产物文件
            // 2. 这行配置与 tsc --noEmit 命令等效
            "noEmit": true,
        },
    }
    ```
  - 在vue的项目中，我们就得使用到 `vue-tsc`

- "preview": 预览打包产物的执行效果。

# css相关改造点

## 样式方案的意义

原生 CSS 开发的各种问题

1. 开发体验欠佳。比如原生 CSS 不支持选择器的嵌套:
   
   ```css
   // 选择器只能平铺，不能嵌套
   .container .header .nav .title .text {
    color: blue;
   }
   
   .container .header .nav .box {
    color: blue;
    border: 1px solid grey;
   }
   ```

2. 样式污染问题。如果出现同样的类名，很容易造成不同的样式互相覆盖和污染。
   
   ```css
   // a.css
   .container {
     color: red;
   }
   
   // b.css
   // 很有可能覆盖 a.css 的样式！
   .container {
     color: blue;
   }
   ```

3. 浏览器兼容问题。为了兼容不同的浏览器，我们需要对一些属性(如transition)加上不同的浏览器前缀，比如 -webkit-、-moz-、-ms-、-o-，意味着开发者要针对同一个样式属性写很多的冗余代码。

4. 打包后的代码体积问题。如果不用任何的 CSS 工程化方案，所有的 CSS 代码都将打包到产物中，即使有部分样式并没有在代码中使用，导致产物体积过大。

--- 

针对如上原生 CSS 的痛点，社区中诞生了不少解决方案，常见的有 5 类。

1. **CSS 预处理器**：主流的包括Sass/Scss、Less和Stylus。这些方案各自定义了一套语法，让 CSS 也能使用嵌套规则，甚至能像编程语言一样定义变量、写条件判断和循环语句，大大增强了样式语言的灵活性，解决原生 CSS 的开发体验问题。

2. **CSS Modules**：能将 CSS 类名处理成哈希值，这样就可以避免同名的情况下样式污染的问题。

3. **CSS 后处理器PostCSS**，用来解析和处理 CSS 代码，可以实现的功能非常丰富，比如将 px 转换为 rem、根据目标浏览器情况自动加上类似于--moz--、-o-的属性前缀等等。

4. **CSS in JS 方案**，主流的包括emotion、styled-components等等，顾名思义，这类方案可以实现直接在 JS 中写样式代码，基本包含CSS 预处理器和 CSS Modules 的各项优点，非常灵活，解决了开发体验和全局样式污染的问题。

5. **CSS 原子化框架**，如Tailwind CSS、Windi CSS，通过类名来指定样式，大大简化了样式写法，提高了样式开发的效率，主要解决了原生 CSS 开发体验的问题。

不过，各种方案没有孰优孰劣，各自解决的方案有重叠的部分，但也有一定的差异





## css预处理器

> Vite 本身对 CSS 各种预处理器语言(Sass/Scss、Less和Stylus)做了内置支持。也就是说，即使你不经过任何的配置也可以直接使用各种 CSS 预处理器。

> 

> 但是由于 Vite 底层会调用 CSS 预处理器的官方库进行编译，而 Vite 为了实现按需加载，并没有内置这些工具库，而是让用户根据需要安装

例如我们要使用 sass预处理

```shell
pnpm install sass
```

之后不需要任何配置就可以使用scss了

### 全局变量的引入

比如我们在全局有许多的样式变量

```scss
$theme-color: #17c2c2;
```

在其他scss文件中引入的时候，常常会需要先导入这个样式变量的文件

```scss
@import './variable.scss';
```

vite中有可配置参数，能够配置全局引入的文件

// vite.config.ts

```ts
// vite.config.ts

import { normalizePath } from 'vite';

// 如果类型报错，需要安装 @types/node: pnpm i @types/node -D

import path from 'path';

// 全局 scss 文件的路径

// 用 normalizePath 解决 window 下的路径问题

const variablePath = normalizePath(path.resolve('./xxxxx'));

export default defineConfig({

// css 相关的配置

css: {

    preprocessorOptions: {

        scss: {

        // additionalData 的内容会在每个 scss 文件的开头自动注入

        additionalData: `@import "${variablePath}";`

        }

    }

   }

})
```





## css modules

> CSS Modules 在 Vite 也是一个开箱即用的能力，Vite 会对后缀带有`.module`的样式文件自动应用 CSS Modules。

直接将相关的样式文件改为，[name].module.scss

[CSS Modules 配置](https://github.com/madyankin/postcss-modules)

例如一个Header组件

- 改造样式文件名称为index.module.scss
  
  ```scss
  .page-header {
      display: flex;
      color: #fff;
      background-color: $theme-color;
  }
  ```

- 在tsx中引入
  
  ```tsx
  import { useState } from "react";
  
  import style from  "./index.module.scss";
  
  function PageHeader() {
    const prefixCls = "w-page-header";
  
    const [count, setCount] = useState(0);
  
    return (
      <div className={style['page-header']}>
        page header
        <button onClick={() => setCount(1)}>add</button>
        {count}
      </div>
    );
  }
  
  export default PageHeader;
  
  ```

- 修改配置，生成的hash
  
  ```ts
  import { defineConfig, normalizePath } from 'vite'
  import react from '@vitejs/plugin-react'
  import path from 'path';
  
  const variablePath = normalizePath(path.resolve('./src/assets/style/variable.scss'));
  
  // https://vitejs.dev/config/
  export default defineConfig({
    root: path.join(__dirname, 'src'),
    plugins: [react()],
    css: {
      modules: {
        // 一般我们可以通过 generateScopedName 属性来对生成的类名进行自定义
        // 其中，name 表示当前文件名，local 表示类名
        generateScopedName: "[name]__[local]___[hash:base64:5]"
      },
      preprocessorOptions: {
        scss: {
          // additionalData 的内容会在每个 scss 文件的开头自动注入
          additionalData: `@import "${variablePath}";`
        }
  
      }
    }
  })
  ```
  
  就可以看到生成的类名为
  
  ![](/Users/leo/Library/Application%20Support/marktext/images/2022-11-06-15-55-54-image.png)

## postcss

> 一般你可以通过 `postcss.config.js` 来配置 postcss ，不过在 Vite 配置文件中已经提供了 PostCSS 的配置入口，我们可以直接在 Vite 配置文件中进行操作。



### autoprefixer

> 这个插件主要用来自动为不同的目标浏览器添加样式前缀，解决的是浏览器兼容性的问题

装上这个插件（不再需要手动安装postcss了，只需要装对应插件）

```shell
pnpm i autoprefixer -D
```

配置vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer';


// https://vitejs.dev/config/
export default defineConfig({
  root: path.join(__dirname, 'src'),
  plugins: [react()],
  css: {
   .....
    postcss: {
      plugins: [
        autoprefixer({
          // 指定目标浏览器
          overrideBrowserslist: [
            'Android 4.1',
            'iOS 7.1',
            'Chrome > 31',
            'ff > 31',
            'ie >= 8',
            '> 1%',]
        })
      ]
    }
  }
})

```

之后打包生成的文件中就能自动添加前缀了

![](/Users/leo/Library/Application%20Support/marktext/images/2022-11-06-16-20-23-image.png)



### 其他插件

> 推荐一个站点：[www.postcss.parts/](https://www.postcss.parts/)

- [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)： 用来将 px 转换为 rem 单位，在适配移动端的场景下很常用。
- [postcss-preset-env](https://github.com/csstools/postcss-preset-env): 通过它，你可以编写最新的 CSS 语法，不用担心兼容性问题。
- [cssnano](https://github.com/cssnano/cssnano): 主要用来压缩 CSS 代码，跟常规的代码压缩工具不一样，它能做得更加智能，比如提取一些公共样式进行复用、缩短一些常见的属性值等等。



## css in js

> 社区中有两款主流的`CSS In JS` 方案: `styled-components`和`emotion`。

对于css in js的方案，我们要考虑多个问题

- 选择器命名问题

- `DCE`(Dead Code Elimination 即无用代码删除)

- `代码压缩`

- `生成 SourceMap`

- `服务端渲染(SSR)`

而`styled-components`和`emotion`已经提供了对应的 babel 插件来解决这些问题，我们在 Vite 中要做的就是集成这些 babel 插件。



### 配置

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        // 加入 babel 插件
        // 以下插件包都需要提前安装
        // 当然，通过这个配置你也可以添加其它的 Babel 插件
        plugins: [
          // 适配 styled-component
          "babel-plugin-styled-components"
          // 适配 emotion
          "@emotion/babel-plugin"
        ]
      },
      // 注意: 对于 emotion，需要单独加上这个配置
      // 通过 `@emotion/react` 包编译 emotion 中的特殊 jsx 语法
      jsxImportSource: "@emotion/react"
    })
  ]
})
```


