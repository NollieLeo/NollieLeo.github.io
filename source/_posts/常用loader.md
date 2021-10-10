---
title: 常用loader
date: 2021-08-05 20:50:16
tags:
- webpack
- loader
categories:
- loader
---

以下讲的都是针对webpack5版本的



## CSS

### css-loaders

[css-loader](https://github.com/webpack-contrib/css-loader)

webpack识别不了css的代码，所以需要一个css-loader去加载css的文件



### style-loader

[style-loader](https://www.npmjs.com/package/style-loader)

将css（以字符串形式）注入到js的代码当中（相当于做了存储），不会额外生成一个CSS文件，之后通过网页的js的操作的时候生成dom（style标签）插入到html中，是一个动态的过程

#### 优点

将css的代码直接放到js当中，不会生成独立css文件，有缓存作用

#### 缺点

js文件变大，网页加载时间变长（可以考虑单独抽离css文件，异步加载）



### postcss-loader

[postcss-loader](https://www.npmjs.com/package/postcss-loader)

使用 PostCSS 处理 CSS 的加载器。一般需要配合`postCSS`的一堆plugin去使用，可以自动为css加上前缀去适配不同浏览器规则，使用css-next的语法等等



## ts

### awesome-typescript-loader

### ts-loader

[为什么有时候不用ts的loader去编译ts而是直接用babel呢](https://zhuanlan.zhihu.com/p/376867546)





## 静态文件

### file-loader

可以将js和css中导入图片的语句替换成正确的地址，同时将文件输出到对应的位置

### url-loader

可以将文件内容经过编码之后注入js或者css当中

> 原因也是显而易见的，再http1.x中，浏览器会对每个域名下的TCP链接做限制，如果图片很多再服务端的话，可能会造成一种情况，请求很多，TCP连接很多，图片请求就很慢，所以直接转成base64就能大大减少请求次数
>
> 当然这块大文件还是不建议转base64的

> webpack 5内置了这些玩意，所以咱们可以直接用webpack5里头的东西了 [assests](https://webpack.docschina.org/guides/asset-modules/)



### mini-svg-data-uri

https://www.npmjs.com/package/mini-svg-data-uri

该工具将 SVG 转换为最紧凑、可压缩的数据：支持 SVG 的浏览器可以容忍的 URI。结果如下所示（169 字节）：

比起转成base64的会小一些，还有那些直接转成url的



###  svg-sprite-loader

https://www.npmjs.com/package/svg-sprite-loader#why-its-cool

svg-sprite-loader 将加载的 svg 图片拼接成 雪碧图，放到页面中，其它地方通过 <use> 复用

> 一般用在菜单的Icon显示以及搭建一些UI的字体库的时候需要用的到



###  raw-loader

https://www.npmjs.com/package/raw-loader

可以将文本文件的内容读取出来注入js或者css中



## Source Map

### source-map-loader

https://www.npmjs.com/package/source-map-loader

使用这个loader去加载别的包的sourcemap方便自己的调试



## 代码检查

