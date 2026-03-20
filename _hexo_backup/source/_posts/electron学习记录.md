---
title: electron学习记录
date: 2022-01-12 14:58:10
tags:
- electron
- Vue

---

## electron

### 核心模块

![WeChat2314efdd8331a8e89163bc315a1a25a4](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录/WeChat2314efdd8331a8e89163bc315a1a25a4.png)



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

![image-20220112153922959](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220112153922959.png)

> 嗯对，继续，想选啥选啥

![image-20220112154019140](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220112154019140.png)

> 然后就在下载了

![image-20220112154214278](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220112154214278.png)



> 然后插件中搜索 `vue-cli-plugin-electron-builder`, 安装他

或者使用 `vue add electron-builder`安装

![image-20220112154326504](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220112154326504.png)

接下来直接就：就ok了

```shell
npm run electron:serve
```

![image-20220112154639191](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220112154639191.png)



## 如何调试主进程

> 基于vscode通过ws协议进行调试，之后通过端口就可进入调试的页面，就形容调试node  [vscode调试官方文档](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations)

### 使用electron自带的

> 插件 electron-debug

1. 在dev文件中引入

   ![image-20220115143454095](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220115143454095.png)

 2. 在主进程中引入

    ![image-20220115143536900](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220115143536900.png)

启动之后呢就能看到终端打印了这句话

![image-20220115143611685](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220115143611685.png)

打开chrome://devices就ok了

### 使用electron-vue + vscode

#### 配置vscode	

1. 找到左侧一个虫子一样的图标

   ![image-20220115112806086](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220115112806086.png)

2. 选择上面的下拉面板，添加配置（这里是node，就选择nodejs）

   ![image-20220115112904875](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220115112904875.png)

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

![image-20220115121624744](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220115121624744.png)



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

![image-20220115121919211](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220115121919211.png)



#### 开始调试

打开vscode 

通过快捷方式`F5`或者手动点击头部菜单 的 运行中的调试就可以开始了

这时候就能在调试控制台看到这句话

![image-20220115122235932](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220115122235932.png)



我们打开浏览器输入`chrome://inspect/#devices`

![image-20220115122309093](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220115122309093.png)

点击inspect就能看到文件了，这时候直接打断点就OK

（正在调试的文件是有绿色的小点点）

![image-20220115122412302](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220115122412302.png)



倘若第一次调试，则需要点击上方的添加文件按钮将目录添加到调试工具当中

![image-20220115122506756](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220115122506756.png)



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

**主线程** 到 **渲染线程** 通过 `mainWin.webContents.send` 来发送 --->`ipcRenderer.on` 来监听

**渲染线程** 到 **主线程** 需要通过 `ipcRenderer.send`发送 ---> `ipcMain.on`来监听



### 原理

electron使用`mojo`的框架完成进程间通信的工作

mojo框架提供了一套地层的ipc实现，包括 消息管道，数据管道，共享缓存缓冲区等等。

electron在api.mojom文件中定义了相关的通信接口描述文件 [源码](https://github.com/electron/electron/blob/main/shell/common/api/api.mojom)

<img src="/Users/leo/Library/Application Support/typora-user-images/image-20220327110355234.png" alt="image-20220327110355234" style="zoom:67%;" />

其中比较重要的就是 `ElectronRenderer` 和 `ElectronApiIPC` 这两个定义，与主进程和渲染进程通信有关

在编译Electron源码的过程，mojo框架会把这些通信描述文件转义为具体的实现代码

之后shell\renderer\api\electron_api_ipc_renderer.cc和shell\browser\api\electron_api_web_contents.cc这两个c++文件都会去引用这个编译之后的文件（shell\common\api\api.mojom.h）头文件。

在我们js代码中使用

```js
await ipcRenderer.invoke('event','message');
```

其实地层走的就是[shell\renderer\api\electron_api_ipc_renderer.cc](https://github.com/electron/electron/blob/main/shell/renderer/api/electron_api_ipc_renderer.cc)

<img src="/Users/leo/Library/Application Support/typora-user-images/image-20220327111337555.png" alt="image-20220327111337555" style="zoom:67%;" />

这段代码除了创建一个 Promise 对象之外，还执行了 electron_brower_remote对象（Mojo的通信对象）的invoke的方法

之后mojo会组织消息，把这个消息发给主进程，并执行了 [electron_api_web_contents.cc](https://github.com/electron/electron/blob/main/shell/browser/api/electron_api_web_contents.cc) 中WebContents::Invoke的方法

<img src="/Users/leo/Library/Application Support/typora-user-images/image-20220327111912387.png" alt="image-20220327111912387" style="zoom:67%;" />

这个方法会发射一个名字为-ipc-invoke的事件，把渲染进程传递过来的数据都发射出去，之后和这个事件会触发位于

lib/browser/api/web-contents/ts的ts代码中

![image-20220327113128169](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录/image-20220327113128169.png)

这个逻辑当中，electron会去查找一个map对象 是否注册了当前的处理逻辑，有的话执行用户代码，否则异常

invoke之后会把处理的结果返回渲染进程（基于mojo的进程通信，实现代码[shell/brower/api/event.cc](https://github.com/electron/electron/blob/main/shell/browser/api/event.cc)）



我们在调用`ipcMain.handle` 方法为主进程注册某事件的处理逻辑时候，实际上执行了 [/lib/brower/ipc-main-tmpl.ts](https://github.com/electron/electron/blob/main/lib/browser/ipc-main-impl.ts)

<img src="/Users/leo/Library/Application Support/typora-user-images/image-20220327114327050.png" alt="image-20220327114327050" style="zoom:67%;" />

就是将用户的处理逻辑包装起来存放到map对象当中，这就对应了上述的invoke触发的时候，做的事情了。

大致是通信的基本逻辑

### 渲染进程和主进程异步通信

#### ipcRenderer.send + ipcMain.on/once

renderer.js (渲染进程文件)

```js
import { ipcRenderer } from 'electron';

function handleMessage(){
  ipcRenderer.send('renderer-to-main', 'this is weng')
}
```

main.js (主进程)

```js
import { ipcMain } from 'electron';

ipcMain.on('renderer-to-main', (event, message)=>{
  console.log('this is a message from weng', message)
})
```



假如主进程需要回复渲染进程的消息

主进程可以通过 `event.reply` 回复**异步消息**，然后前提是渲染进程也需要监听这个事件

renderer.js

```js
import { ipcRenderer } from 'electron';

function handleMessage(){
  ipcRenderer.send('renderer-to-main', 'this is weng')
}
ipcRenderer.on('main-to-renderer',(event, message)=>{
  console.log('reply to weng', message); // 给翁恺敏发消息
})
```

Main.js

```js
import { ipcMain } from 'electron';

ipcMain.on('renderer-to-main', (event, message)=>{
  console.log('this is a message from weng', message)
  event.reply('main-to-renderer', "给翁恺敏发消息");
})
```

1、主进程通过 `ipcMain.on` 来监听渲染进程的消息；

2、主进程接收到消息后，可以回复消息，也可以不回复。如果回复的话，通过 `event.reply` 发送另一个事件，渲染进程监听这个事件得到回复结果。如果不回复消息的话，渲染进程将接着执行 `ipcRenderer.send` 之后的代码。

上面提到过了, `send` 这样的方式，主进程可以给回复，也可以不给回复，但是得通过 `event.replay`。如果此时你试图用 `return` 的方式传递返回值的话，结果并不能达到你的预期。





#### ipcMain.handle/handleOnce + ipcRenderer.invoke

> 这是另外一种通信手段

main.js

```js
// main.js
const { ipcMain } = require('electron');

// 返回的数据将会被promise包裹
ipcMain.handle('render-invoke-to-main', async (event, message) => {
  console.log(`receive message from render: ${message}`)
  const result = await asyncWork();
  return result; // 假如需要回复渲染进程直接return就行
})

const asyncWork = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('延迟 2 秒获取到主进程的返回结果')
    }, 2000)
  })
}
```

renderer.js

```js
// render.js
const { ipcRenderer } = require('electron');

async function invokeMessageToMain() {
  const replyMessage = await ipcRenderer.invoke('render-invoke-to-main', '我是渲染进程通过 invoke 发送的消息');
  console.log('replyMessage', replyMessage);
}

```

1、主进程通过 `ipcMain.handle` 来处理渲染进程发送的消息；

2、主进程接收到消息后，可以回复消息，也可以不回复。如果回复消息的话，可以通过 `return` 给渲染进程回复消息；如果不回复消息的话，渲染进程将接着执行 `ipcRenderer.invoke` 之后的代码。

3、渲染进程异步等待主进程的回应， `invoke` 的返回值是一个 `Promise<pending>` 。



#### **window.webContents.send**

> 这种方式依赖于 `webContents` 对象，它是我们在项目中新建窗口时，产生的窗口对象上的一个属性。



```js
// 窗口在完成加载时，通过 webContents.send 给渲染进程发送消息
window.webContents.on('did-finish-load', () => {
  window.webContents.send('main-send-to-render', '启动完成了')
})
```



之前我们通过渲染进程监听主进程的事件

```js
// render.js
const { ipcRenderer } = require('electron');

ipcRenderer.on('main-send-to-render', (event, message) => {
  console.log(`receive message from main: ${message}`)
})

```



### 渲染进程和主进程的同步通信

#### ipcRenderer.sendSync + ipcMain.on/once

renderer.js

```js
// render.js
const { ipcRenderer } = require('electron');

function sendSyncMessageToMain() {
  const replyMessage = ipcRenderer.sendSync('render-send-sync-to-main', '我是渲染进程通过 syncSend 发送给主进程的消息');
  console.log('replyMessage', replyMessage); // '主进程回复的消息'
}

```



Main.js

```js
// main.js
const { ipcMain } = require('electron');

ipcMain.on('render-send-sync-to-main', (event, message) => {
  console.log(`receive message from render: ${message}`)
  event.returnValue = '主进程回复的消息'; 
})

```



1、主进程通过 `ipcMain.on` 来处理渲染进程发送的消息；

2、主进程通过 `event.returnValue` 回复渲染进程消息；

3、如果 `event.returnValue` 不为 `undefined` 的话，渲染进程会等待 `sendSync` 的返回值才执行后面的代码；

4、请保证 `event.returnValue`是有值的，否则会造成非预期的影响。



上面的案例，主进程绑定的处理函数是一个同步的，我们将它换为异步的来看看：

```javascript
// main.js
const { ipcMain } = require('electron');

ipcMain.on('render-send-sync-to-main', async (event, message) => {
  console.log(`receive message from render: ${message}`)
  const result = await asyncWork();
  event.returnValue = result;
})

const asyncWork = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('延迟 2 秒获取到主进程的返回结果')
    }, 2000)
  })
}

```

这次我们在执行完一个异步函数 `asyncWork` 之后再给 `event.returnValue` 赋值。

结果发现渲染进程那边会在 2 秒之后才打印：

```
"replyMessage 延迟 2 秒获取到主进程的返回结果"

```

而且对于渲染进程，以下两种写法，结果都是一样的：

```javascript
// render.js
const { ipcRenderer } = require('electron');

function sendSyncMessageToMain() {
  const replyMessage = ipcRenderer.sendSync('render-send-sync-to-main', '我是渲染进程通过 syncSend 发送给主进程的消息');
  console.log('replyMessage', replyMessage); // 'replyMessage 延迟 2 秒获取到主进程的返回结果''
}

// 或者改用 async 函数
async function sendSyncMessageToMain() {
  const replyMessage = await ipcRenderer.sendSync('render-send-sync-to-main', '我是渲染进程发送给主进程的同步消息');
  console.log('replyMessage', replyMessage); // 'replyMessage 延迟 2 秒获取到主进程的返回结果'
}

```

也就是说，不论渲染进程在接收 `sendSync` 结果的时候，是不是用 `await` 等待，都会等待结果返回后才向下执行。但如果你已经确定你的请求是一个异步的话，建议还是使用 `invoke` 去发送消息，这里出于两点原因考虑：

1、方法名 `sendSync` 就很符合语义，发送同步消息；

2、请求执行的明明是异步代码，但是如果你用 `const replyMessage = ipcRenderer.sendSync('xxx')` 方式来获取响应信息，会很奇怪。

OKK，上面的第四点谈到了，请保证 `event.returnValue` 是有值的，否则会照成非预期的影响。让我们也来写个例子：

```javascript
// render.js
const { ipcRenderer } = require('electron');

function sendSyncMessageToMain() {
  const replyMessage = ipcRenderer.sendSync('render-send-sync-to-main', '我是渲染进程通过 syncSend 发送给主进程的消息');
  console.log('replyMessage', replyMessage); // replyMessage {error: "reply was never sent"}
  console.log('next'); // 这里也会执行
}

// main.js
ipcMain.on('render-send-sync-to-main', async (event, message) => {
  console.log(`receive message from render: ${message}`)
})

```

在上面的例子中，主进程那边不对 `event.returnValue` 做处理，在渲染进程这边将会得到一个错误：

```javascript
{error: "reply was never sent"}

```

虽然 `next` 也会打印，但是如果你再想去发送一次 `render-send-sync-to-main` 你会发现页面已经卡了...



### 渲染进程与渲染进程(窗口与窗口)的通讯

#### ipcRenderer.sendTo + ipcRenderer.on

> 举个例子：B窗口给你A窗口发送消息

窗口A

```js
ipcRenderer.on('B-to-A',(event,message)=>{
  console.log(message)
})
```

窗口B

```js
const A_ID = ipcRenderer.sendSync('getWinId', 'A')
ipcRenderer.sendTo(A_ID,'B-to-A','我是来自B窗口的消息')
```



### 渲染进程和webview的通讯

#### ipcRenderer.sendToHost + webview.addEventListener("ipc-message")

渲染进程

```js
const webview = document.querySelector('webview');
webview.addEventListener('ipc-message',(event, message)=>{
  console.log(message)
})

webview.send('rende-to-webview','发给webview里头的界面'); // 给webview发消息
```

webview内嵌的页面

```js
import { ipcRenderer } from 'electron';

ipcRenderer.on('send-to',(event,args)=>{
	console.log('收到渲染进程发来的消息',args);
  ipcRenderer.sendToHost('message', '我是webview发过来的消息')
})
```



#### webview + preload协议 提供桥接方法

通过利用webview的preload属性 [preload](https://www.electronjs.org/zh/docs/latest/api/webview-tag#preload)

> preload其实是相当于一个页面运行其他脚本之前，先加载的指定脚本

有一点需要注意的是，webview的preload属性接受的是asar和file协议，注入js脚本

preload.js

```js
import { ipcRenderer } from 'electron';
const Bridge = {
  ...各种方法或者什么参数
  sayHi(data){
    ipcRenderer.send('some-event', dataÏ)
  }
}
  
global.Bridge = Bridge; // 将Bridge的对象注入到全局对象上，webview打开的时候指的就是window
```

webview内嵌的页面

```js
const myBridge = window.Bridge;

myBridge.sayHi('我是webview')
```

处理地址

```js
const localPreloadFile = `file://${require('path').resolve('./preload.js')}`
webview.setAtrribute('preload',preloadFileÏ)
```

<img src="/Users/leo/Library/Application Support/typora-user-images/image-20220326183153864.png" alt="image-20220326183153864" style="zoom: 67%;" />

通过桥接的方法，实现electron的通信机制的转发，进而实现webview和渲染进程之间的沟通



### 进程统一实现方案（暂未完善）

```js
import events from "events";
import { ipcRenderer, ipcMain, webContents } from "electron";

const PIPE_EVENT = "__eventPipe";

class Eventer {
  constructor() {
    this.instance = new events.EventEmitter();
    this.instance.setMaxListeners(20);
    this.initEventPipe();
  }

  /**
   * @description: 初始化管道配置
   */
  initEventPipe() {
    if (ipcRenderer) {
      ipcRenderer.on(PIPE_EVENT, (e, { eventName, eventArgs }) => {
        this.instance.emit(eventName, eventArgs);
      });
    }
    if (ipcMain) {
      ipcMain.handle(PIPE_EVENT, (e, { eventName, eventArgs }) => {
        this.instance.emit(eventName, eventArgs);
        webContents.getAllWebContents().forEach((wc) => {
          if (wc.id !== e.sender.id) {
            wc.send(PIPE_EVENT, { eventName, eventArgs });
          }
        });
      });
    }
  }

  /**
   * @description: 监听事件
   * @param {*} eventName 事件名称
   * @param {*} callBack 回调
   * @return {*}
   */
  on(eventName, callBack) {
    this.instance.on(eventName, callBack);
  }

  /**
   * @description: 事件触发
   * @param {*} eventName
   * @param {*} eventArgs
   */
  emit(eventName, eventArgs) {
    this.instance.emit(eventName, eventArgs);
    if (ipcMain) {
      webContents.getAllWebContents().forEach((wc) => {
        wc.send(PIPE_EVENT, { eventName, eventArgs });
      });
    }
    if (ipcRenderer) {
      ipcRenderer.invoke(PIPE_EVENT, { eventName, eventArgs });
    }
  }
}

const event = new Eventer();

export default event;
```



主进程

```js
import eventer from '@/common/eventer';

eventer.on('my-event', (args)=>{
  console.log(args)
})
```

渲染进程

```js
import eventer from '@/common/eventer';
eventer.emit('my-event',(args)=>{
  console.log(args);
})
```





## 一些使用记录

### 按键配置

https://www.electronjs.org/zh/docs/latest/api/accelerator

### 渲染进程和webview的通信

```js
const webview = document.querySelector('webview');
webview.addEventListener('dom-ready',()=>{});
webview.addEventListener('ipc-message', ()=>{
  webview.send('sth')
})


ipcRenderer.sendToHost('sth')


// preload
const preloadFile = 'file://' + require('path').resolve('./preload.js');
webview.setAttribute('preload', preloadFile);
```

```js
// 客户端
const clientSocket = io('http://127.0.0.1:3000/')
```



### menu（应用菜单）

```js
const menuTemplate = [
  IS_MAC && { label: "ismac" }, //  macOS下第一个标签是应用程序名字,所以这里是为了兼容mac的
  {
    label: "选项",
    submenu: [
      {
        label: "退出",
        role: "quit",
      },
      {
        label: "我的博客",
        click: createBlogWin,
      },
      isDevelopment && {
        label: "打开devTool",
        click: createDevTool,
        accelerator: "CommandOrControl + shift + i",
      },
    ].filter(Boolean),
  },
  { type: "separator" }, // mac下无效
  {
    label: "文件",
    submenu: [
      {
        label: "子菜单",
        click: () => {
          // 调用了dialog（弹窗模块），演示效果
          dialog.showMessageBoxSync({
            type: "info",
            title: "提示",
            message: "点击了子菜单",
          });
        },
      },
    ],
  },
].filter(Boolean);

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
```

比较要注意的就是mac的第一个菜单被系统设置为了应用的名称等等

所以最上面的数组加了一行**mac**相关的是配

### cookie

#### 基本使用

```js
const { remote } from 'electron';

const getCookie = async (name)=> {
  let cookie = await remote.session.defautlSession.cookies.get({name});
  if(cookie.length) return cookies[0].value;
  else return ''
}
const setCookie = async (cookie) => {
  await remote.session.defautlSession.cookies.set(cookie)
}
```

- defaultSession是当前浏览器会话的对象实例，也可以通过`window.webContents.session`获取session对象



### 删除浏览器缓存

```js
await remote.session.defaultSession.cookie.clearStorageData({
  storages: 'localstorage, cookie' // 删除localStroage中和cookie的缓存数据
})
```

storages的参数可以查看 [官方文档](https://www.electronjs.org/zh/docs/latest/api/session#sesclearstoragedataoptions)

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


## electron项目中常用的库

### mousetrap

按键事件的监听库，监听网页的按键事件

### SQLite持久化数据

推荐二次封装库 `node-sqlite3`

三次封装库 `knextjs`

<img src="/Users/leo/Library/Application Support/typora-user-images/image-20220301000309311.png" alt="image-20220301000309311" style="zoom:50%;" />



### lowdb和electron-store

小型的数据存储工具

## 离谱的坑

### 控制台打印乱码

> 这种情况是由于控制台输出的不是UTF-8的编码格式

![image-20220112210828647](/Users/leo/Desktop/weng's code/weng'blog/NollieLeo.github.io/source/_posts/electron学习记录\image-20220112210828647.png)

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

