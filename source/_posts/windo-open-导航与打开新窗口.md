---
title: windo.open(导航与打开新窗口)
date: 2021-05-26 15:59:48
tags:
- Javascript
- window.open
- 导航
categories:
- Javascript
---



# 导航与打开新窗口

window.open()

1. 用于导航到指定的URL
2. 打开新浏览器窗口

接受4个参数，**指定URL**，**目标窗口**（名字），**特性字符串**，表示新窗口在浏览器历史记录中**是否替代当前加载页面**的布尔值（一般在不打开新窗口的时候使用）

```js
window.open("https://www.baidu.com/", "baidu");
// 与<a href="https://www.baidu.com/" target="baidu" />
```

如果有一个窗口名叫baidu，则这个窗口就会打开这URL；否者就会打开一个新窗口并将其命名为baidu

第二个参数也可以是如下几个

- _self
- _parent
- _top
- _blank

## 1. 弹出窗口

window.open会返回一个对象，可以通过调用他的api去操作打开的这个新窗口

```js
const openWindow = window.open('https://www.baidu.com/','baidu','height=400,width=500,top=10,left=10,resizable=yes');

// 移动打开的窗口
openWindow.moveTo(100, 100);
// 关闭打开的窗口
openWindow.close();

//关闭之后这个对象仍然存在,可以判断它closed属性
window.closed // true;
```

弹出的窗口可以关闭自己

```js
top.close();
```

新建的窗口window对象上有个属性`opener`,指向他打开的窗口

这个属性只在弹出窗口的最上层window对象有定义,就是指针

```js
opendWidon.opener === window // true
```

因为有了这个指针,表示的新开的窗口不能独立运行在进程当中,如果需要则需要把opener属性设置为null,与主页面切断链接之后,这个链接是不可以在恢复的

## 2.判断弹窗是否被屏蔽了

浏览器可能存在弹窗屏蔽程序,所以可以通过检测window.open()返回的值是否为null就能确定弹窗是否被屏蔽了

但是有时候window.open都会报错

所以用一层trycatch包裹会好一点

```js
let blocked = false;
try{
    let openWindow = window.open('https://baidu.com',"_blank");
    if(openWindow === null){
        blocked = true;
    }
} catch(e){
    blocked = true
}
```



