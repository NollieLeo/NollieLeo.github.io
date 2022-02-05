---
title: electron学习记录
date: 2022-01-12 14:58:10
tags:
- electron
- vue

---

## 快速搭建demo

### 官方demo快速搭建（electron-quick-template）

[git地址](https://github.com/electron/electron-quick-start)

```shell
# Clone this repository
git clone https://github.com/electron/electron-quick-start
# Go into the repository
cd electron-quick-start
# Install dependencies
npm install
# Run the app
npm start
```

### 搭建vue + electron

#### 使用electron-vue 

> [中文文档](https://simulatedgreg.gitbooks.io/electron-vue/content/cn/)

```shell
# 安装 vue-cli 和 脚手架样板代码
npm install -g vue-cli
vue init simulatedgreg/electron-vue my-project

# 安装依赖并运行你的程序
cd my-project
yarn # 或者 npm install
yarn run dev # 或者 npm run dev
```



#### 使用vue cli自带的可视化创建项目

> vue cli有很多插件化的东西可以用

```shell
# 打开可视化界面
vue ui
```

如图：

<img src="C:\Users\Weng\AppData\Roaming\Typora\typora-user-images\image-20220112153725964.png" alt="image-20220112153725964" style="zoom: 50%;" />

> 然后点新增一个

![image-20220112153922959](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220112153922959.png)

> 嗯对，继续，想选啥选啥

![image-20220112154019140](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220112154019140.png)

> 然后就在下载了

![image-20220112154214278](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220112154214278.png)



> 然后插件中搜索 `vue-cli-plugin-electron-builder`, 安装他

或者使用 `vue add electron-builder`安装

![image-20220112154326504](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220112154326504.png)

接下来直接就：就ok了

```shell
npm run electron:serve
```

![image-20220112154639191](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220112154639191.png)



## 如何调试主进程

> 基于vscode通过ws协议进行调试，之后通过端口就可进入调试的页面，就形容调试node  [vscode调试官方文档](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations)

### 使用electron自带的

> 插件 electron-debug

1. 在dev文件中引入

   ![image-20220115143454095](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220115143454095.png)

 2. 在主进程中引入

    ![image-20220115143536900](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220115143536900.png)

启动之后呢就能看到终端打印了这句话

![image-20220115143611685](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220115143611685.png)

打开chrome://devices就ok了

### 使用electron-vue + vscode

#### 配置vscode	

1. 找到左侧一个虫子一样的图标

   ![image-20220115112806086](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220115112806086.png)

2. 选择上面的下拉面板，添加配置（这里是node，就选择nodejs）

   ![image-20220115112904875](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220115112904875.png)

 3. vscode会自动创建一个文件 .vscode/路径下的launch.json文件。

    launch.json

    > 基于electron-vue的配置（以下配置再用electron-vue的时候复制进去吧）

    ```json
    {
      "version": "0.2.0",
      "configurations": [
        {
          "name": "Electron Main",
          "program": "${workspaceFolder}/.electron-vue/dev-runner.js",
          "request": "launch",
          "skipFiles": [
            "<node_internals>/**"
          ],
          "type": "node",
          "autoAttachChildProcesses": true,
          "protocol": "inspector"
        }
    	]
    }
    ```

    这里的program指的是调试的入口文件，如果是用 官方的快速 模板搭建的话，就是main.js，而electron-vue则得是`.electron-vue/dev-runner.js`文件

#### 修改electron-vue相关配置文件

##### webpack.main.config.js

> 再electron-vue搭建的目录.electron-vue下的webpack.main.config.js

添加配置

![image-20220115121624744](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220115121624744.png)



##### dev-runner.js

> 再electron-vue搭建的目录.electron-vue下的dev-runner.js

把 .electron-vue/dev-runner.js 里以下报错代码注释掉。

```js
// // detect yarn or npm and process commandline args accordingly
// if (process.env.npm_execpath.endsWith('yarn.js')) {
//   args = args.concat(process.argv.slice(3))
// } else if (process.env.npm_execpath.endsWith('npm-cli.js')) {
//   args = args.concat(process.argv.slice(2))
// }

```

这样是为了避免控制台报错

![image-20220115121919211](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220115121919211.png)



#### 开始调试

打开vscode 

通过快捷方式`F5`或者手动点击头部菜单 的 运行中的调试就可以开始了

这时候就能在调试控制台看到这句话

![image-20220115122235932](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220115122235932.png)



我们打开浏览器输入`chrome://inspect/#devices`

![image-20220115122309093](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220115122309093.png)

点击inspect就能看到文件了，这时候直接打断点就OK

（正在调试的文件是有绿色的小点点）

![image-20220115122412302](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220115122412302.png)



倘若第一次调试，则需要点击上方的添加文件按钮将目录添加到调试工具当中

![image-20220115122506756](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220115122506756.png)



### vue-cli + vue-cli-plugin-electron-builder 调试

[官方文档](https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#multiple-pages)

调试demo[地址](https://github.com/nklayman/electron-vscode-debug-example/blob/master/.vscode/tasks.json)



### 其他调试的launch.json配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      //方式一
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "timeout": 60000, //避免出现can not connect to the target错误
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
      },
      "args" : ["."],
      "env": {
        "NODE_ENV": "development"
      },
      "protocol": "inspector"
    },
    {
      //方式二
      "name": "Attach",
      "type": "node",
      "request": "attach",
      "port": 5858,
      "sourceMaps": true,
      "address": "localhost",
      "timeout": 60000 //避免出现can not connect to the target错误
    }
  ]
}
```





## 进程之间的通信

> 官方文档：
>
> [ipcMain](https://link.juejin.cn/?target=https%3A%2F%2Fwww.electronjs.org%2Fdocs%2Fapi%2Fipc-main)
>
> [ipcRenderer](https://link.juejin.cn/?target=https%3A%2F%2Fwww.electronjs.org%2Fdocs%2Fapi%2Fipc-renderer)
>
> [webContents](https://link.juejin.cn/?target=https%3A%2F%2Fwww.electronjs.org%2Fdocs%2Fapi%2Fweb-contents%23contentssendchannel-args)

毋庸置疑首先先有一个主进程（package.json里头配置的入口文件），官方quick demo是main.js, 用vue cli搭建出来的是background.js

```js
const { app } = require('electron');

let mainWin;

app.whenReady().then(()=>{
    mainWin = new BrowerWindow({
        width: 800, //设置窗口宽高
    	height: 600,
        // 进行对首选项的设置
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true, //设置能在页面使用nodejs的API
            contextIsolation: false, //关闭警告信息
    	},
    })
})

```

**主线程** 到 **渲染线程** 通过 `mainWin.webContents.send` 来发送 --->`ipcRenderer.on` 来监听

**渲染线程** 到 **主线程** 需要通过 `ipcRenderer.send`发送 ---> `ipcMain.on`来监听



### 主进程到渲染

```js
// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  setTimeout(() => {
    mainWindow.webContents.send('welcome', 'happy hacking!')
  }, 3000)

  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
```

renderer.js

```js
const { ipcRenderer } = require('electron');

ipcRenderer.on('welcome', (event, task) => {
  console.log(task)
  document.getElementById('welcome').innerText = task
})
```





### 渲染进程到主进程

main.js

```js
ipcMain.on('quitTask', (event, task) => {
  if (task === 'quit') {
    app.quit()
  }
})
```

renderer.js

```js
function handleQuit () {
  ipcRenderer.send('quitTask', 'quit')
}

document.querySelector('#quitButton').addEventListener('click', handleQuit)
```



## 一些使用记录

### 判断操作系统类型

> process.platform [文档](http://nodejs.cn/api/process/process_platform.html)

```js
import { platform } from 'process';

console.log(`This platform is ${platform}`);
```

- 'aix'
- 'darwin'
- 'linux'
- 'freebsd'
- 'openbsd'
- 'sunos'
- 'win32'

### BrowserWindow

#### webSecurity

[官方](https://www.electronjs.org/zh/docs/latest/tutorial/security#6-%E4%B8%8D%E8%A6%81%E7%A6%81%E7%94%A8websecurity)

禁用同源策略 (通常用来测试网站)，设置false禁用网站的同源政策

> 禁用 `webSecurity` 将会禁止同源策略并且将 `allowRunningInsecureContent` 属性置 `true`。 换句话说，这将使得来自其他站点的非安全代码被执行。



### net请求库（原生）

> 主进程
>
> [官方使用文档](https://www.electronjs.org/zh/docs/latest/api/net)



### dialog（系统对话框）

> 主进程使用
>
> [官方使用文档](https://www.electronjs.org/zh/docs/latest/api/dialog)



### *使用webview（不稳定）

> 假如要在页面中使用webview的话，需要设置BrowserWindow 初始化的时候的配置 `webviewTag: true` 
>
> [官方建议文档](https://www.electronjs.org/zh/docs/latest/tutorial/web-embeds#webview)
>
> [官方使用文档](https://www.electronjs.org/zh/docs/latest/api/webview-tag#src)

main.js

```js
const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    	webviewTag: true
    }
})


```
## 离谱的坑

### 控制台打印乱码

> 这种情况是由于控制台输出的不是UTF-8的编码格式

![image-20220112210828647](E:\Weng-Codes\NollieLeo.github.io\source\_posts\electron学习记录\image-20220112210828647.png)

**解决：**

执行start的脚本中加入

```json
"start": "chcp 65001 && ...."	
```

### electron的包装不上

**解决：**将electron包的源改为国内的源：

.npmrc文件中强制指定源

```
electron_mirror="https://npm.taobao.org/mirrors/electron/"
```

