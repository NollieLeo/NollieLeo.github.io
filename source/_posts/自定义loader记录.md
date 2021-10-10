---
title: 自定义loader记录
date: 2021-10-10 16:01:49
tags:
- loader
- webpack
categories:
- loader
---

## 调试loader

### 1. 准备好自己的webpack和loader

这里我用的项目是我自己的

[webpack template](https://github.com/NollieLeo/own-ReactTsAppCreateTemplate)

### 2. vscode配置debug配置文件

按照这个步骤配置完会生成一个.vscode文件夹下面有个launch.json文件

 ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae53a2653c7e43799c9802a100886a37~tplv-k3u1fbpfcp-watermark.awebp) 

然后替换它

```js
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Webpack Debug",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "npm",
      "runtimeArgs": [
        "run",
        "debug"
      ],
      "port": 5858
    }
  ]
}
```

利用以上配置信息，我们创建了一个 **Webpack Debug** 的调试任务。当运行该任务的时候，会在当前工作目录下执行 `npm run debug` 命令。因此，接下来我们需要在 **package.json** 文件中增加 **debug** 命令，具体内容如下所示：

```json
{
  "scripts": {
    "debug": "webpack --config build/webpack.dev.js"
  }
}
```



### 3. 把自定义loader写道自己的rule里头

![image-20211010161220568](image-20211010161220568.png)

然后打断点

![image-20211010161333822](image-20211010161333822.png)

### 4.启动调试

![image-20211010161437329](image-20211010161437329.png)

