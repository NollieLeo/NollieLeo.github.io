---
title: webpack记录
date: 2021-08-05 20:24:49
tags:
- webpack
categories:
- webpack
---






## 前置包

### webpack-cli

https://github.com/webpack/webpack-cli/issues

### webpack-dev-server

将 webpack 与提供实时重新加载的开发服务器一起使用。这应该仅用于开发。它在底层使用 webpack-dev-middleware，它提供对 webpack 资产的快速内存访问。



## source map 配置详情

 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b6d1ed68645848688ab9cb5a5790724d~tplv-k3u1fbpfcp-watermark.awebp) 



## 优化手段

### output

浏览器缓存，就是进入某个网站后，加载的静态资源被浏览器缓存，再次进入该网站后，将直接拉取缓存资源，加快加载速度。

webpack 支持根据资源内容，创建 hash id，当资源内容发生变化时，将会创建新的 hash id。

配置 JS bundle hash，`webpack.js` 配置方式如下：

```js
module.exports = {
  // 输出
  output: {
    // 仅在生产环境添加 hash
    filename: ctx.isEnvProduction ? '[name].[contenthash].bundle.js' : '[name].bundle.js',
  },
}

```



### tree shaking

- js的shaking看这个 [原理](https://juejin.cn/post/6993275177647751182)

### loader优化

1. 使用`babel-loader`可以开启缓存，在第2次编译时，直接使用**缓存**，不用重新编译，缓存一般只适用于开发环境
2. 使用`include`或`exclude`适当缩小`loader`的适用范围，让其更快找到要解析的文件，开发和生产环境皆适用

```json
 module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/i,
          use: ['babel-loader?cacheDirectory'],
          exclude: /node_modules/,
          include: /src/,
        },
      ]
 }
```



### 压缩 css 文件

使用css-minimizer-webpack-plugin

```js
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
          parallel: 4,
        }),
    ],
  }
}

```







### 输出结果不携带路径信息

默认 webpack 会在输出的 bundle 中生成路径信息，将路径信息删除可小幅提升构建速度。

```
module.exports = {
    output: {
        pathinfo: false,
      },
    };
}
```



### React的优化

- 可以使用  [react-refresh-webpack-plugin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fpmmmwh%2Freact-refresh-webpack-plugin) 这个plugin来实现react组件的热更新

### 优化 resolve 配置

#### 1. alias

alias 可以创建 `import` 或 `require` 的别名，用来简化模块引入。

#### 2. extensions

根据项目中的文件类型，定义 extensions，以覆盖 webpack 默认的 extensions，加快解析速度。

由于 webpack 的解析顺序是从左到右，因此要将使用频率高的文件类型放在左侧，如下我将 `tsx` 放在最左侧。

`webpack.common.js` 配置方式如下：

```javascript
module.exports = {
    resolve: {
        extensions: ['.tsx', '.js'], // 因为我的项目只有这两种类型的文件，如果有其他类型，需要添加进去。
    }
}
```



#### 3. modules

modules 表示 webpack 解析模块时需要解析的目录。

指定目录可缩小 webpack 解析范围，加快构建速度。

`webpack.common.js` 配置方式如下：

```javascript
module.exports = {
    modules: [
      'node_modules',
       paths.appSrc,
    ]
}
```

#### 4. symlinks

如果项目不使用 symlinks（例如 `npm link` 或者 `yarn link`），可以设置 `resolve.symlinks: false`，减少解析工作量。

`webpack.common.js` 配置方式如下：

```
module.exports = {
    resolve: {
        symlinks: false,
    },
}
```






### 缓存

> webpack5之前
>
> 利用 `cache-loader` 将结果缓存中磁盘中；利用 `hard-source-webpack-plugin` 将结果缓存在 `node_modules/.cache` 下提升二次打包速度；利用 `DllReferencePlugin` 将变化不频繁的第三方库`提前单独`打包成动态链接库，提升真正业务代码的打包速度

然而。。webpack5自带了配置项

开发环境 `webpack.dev.js`

```javascript
cache: {
    type: 'memory'
},
复制代码
```

生产环境 `webpack.pro.js`

```javascript
cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
},
```



### 打包时清除上次构建产物

打包目录下面可能会存在大量上次打包留下来的产物，时间长了就会有很多无用的代码

webpack5.20之前这里推荐使用[CleanWebpackPlugin](https://www.npmjs.com/package/clean-webpack-plugin)

之后就可以用`output.clean`为true清除



### js代码压缩

webpack5之前我们是需要` terser-webpack-plugin `这个包的并且需要以下配置

```js
const TerserPlugin = require('terser-webpack-plugin')

module.exports = { 
// ...other config
optimization: {
  minimize: !isDev,
  minimizer: [
    new TerserPlugin({
      extractComments: false, 
      terserOptions: { 
        compress: { 
          pure_funcs: ['console.log'] 
        }
      }
    }) ]
 }
```



但是webpack5自带了代码压缩

```js
  // webpack.config.js中
  module.exports = {
     optimization: {
       usedExports: true, //只导出被使用的模块
       minimize : true // 启动压缩
     }
  }

```

当然你如果需要自定义的话也可以安装这个插件，然后自定义配置

```js
const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
    optimization: {
        minimizer: [
            new TerserPlugin({
              parallel: 4,
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
            }),
        ]
    }
}

```







### 合并模块

> 普通打包只是将一个模块最终放到一个单独的立即执行函数中，如果你有很多模块，那么就有很多立即执行函数。concatenateModules 可以要所有的模块都合并到一个函数里面去。



### 热更新

- 自动刷新
   是指在修改模块内存时，浏览器会自动刷新页面来更新视图内容，是整个页面刷新，速度较慢；刷新页面还会导致临时状态丢失（比如表单内容）

- 热更新
   是在不刷新页面的情况下，使新代码生效，整个网面不会刷新，状态也不会丢失

```js
target: 'web',
plugins: [
	new webpack.HotModuleReplacementPlugin({})
]
```



### noParse

 `noParse`是用来过滤不需要解析的模块，比如`jquery`,`lodash`之类的，这些库一般不会再引入其它库，所以不需要`webpack`去解析其依赖，也不用打包，只是直接引用即可

```js
module: {
  noParse: /jquery|lodash/,
}
```



### 多线程打包
[thread-loader](https://www.npmjs.com/package/thread-loader)

 将耗时的 loader 放在一个独立的 worker 池中运行，加快 loader 构建速度。 

> [webpack 官网](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.docschina.org%2Fguides%2Fbuild-performance%2F%23sass) 提到 `node-sass` 中有个来自 Node.js 线程池的阻塞线程的 bug。 当使用 `thread-loader` 时，需要设置 `workerParallelJobs: 2`。

由于 thread-loader 引入后，需要 0.6s 左右的时间开启新的 node 进程，如果项目代码量小，引入 thread-loader就没什么必要了

 我们应该仅在非常耗时的 loader 前引入 thread-loader。 

### 优化图片



## 使用打包大小分析工具

[how to use webpack-bundle-analyzer](https://stackoverflow.com/questions/50260262/how-to-run-webpack-bundle-analyzer/50260397)

[webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)



## 升级webpack5遇到的问题

### node的一些模块webpack不自带了



