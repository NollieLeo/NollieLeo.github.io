---
title: 从页面 A 打开一个新页面 B，B 页面关闭（包括意外崩溃），如何通知 A 页面？
date: 2021-05-26 16:23:49
tags:
- Javascript
- 面试题
- onbeforeunload
- onunload
categories:
- 面试题

---



# 从页面 A 打开一个新页面 B，B 页面关闭（包括意外崩溃），如何通知 A 页面？

首先能够拆解一下这个题意

1. B手动关闭，如何通知A页面
2. B意外关闭，被线程杀死奔溃的时候如何通知A页面



## 1. B页面正常关闭的时候

**1.** 首先要回答出页面关闭时会触发的事件是什么？

页面关闭时先执行`window.onbeforeunload`，然后执行`window.onunload`

我们可以在 `window.onbeforeunload` 或 `window.onunload` 里面设置回调。

**2.** 然后回答如何传参？

最先想到的是：用 `window.open` 方法跳转到一个已经打开的页面（A页面），url 上可以挂参传递信息。

**在 chrome 浏览器下会报错**`“Blocked popup during beforeunload.”`

在 MDN 里找到了解释：HTML规范指出在此事件中调用window.alert()，window.confirm()以及window.prompt()方法，可能会失效。[Window: beforeunload event](https://developer.mozilla.org/zh-CN/docs/Web/Events/beforeunload)

**在火狐浏览器下不会报错**，可以正常打开 A 页面。

**3.** 成功传参后，A 页面是如何监听 URL 的？

onhashchange 是为您排忧解难。[Window: hashchange event](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/hashchange_event)：当URL的片段标识符更改时，将触发hashchange事件 (跟在＃符号后面的URL部分，包括＃符号)

如果你传参是以 A.html?xxx 的形式，那就需要监听 window.location.href。



// 页面A

```html
<html>
<head>
</head>
<body>
    <div>这是 A 页面</div>
    <button onclick="toB()">点击打开 B 页面</button>
    <script>
        window.name = 'A' // 设置页面名
        function toB() {
            window.open("B.html", "B") // 打开新页面并设置页面名
        }
        window.addEventListener('hashchange', function () {// 监听 hash
            alert(window.location.hash)
        }, false);
    </script>
</body>
</html>

```



// 页面B

```html
<html>
<head>
</head>
<body>
    <div>这是 B 页面</div>
    <script>
        window.onbeforeunload = function (e) {
            window.open('A.html#close', "A") // url 挂参 跳回到已打开的 A 页面
            return '确定离开此页吗？';
        }
    </script>
</body>
</html>

```



其实传参也可以通过**本地缓存传参**，A 页面设置监听,在 B 页面设置 loacalStorage

```js
// A.html
window.addEventListener("storage", function (e) {// 监听 storage
    alert(e.newValue);
});
// B.html
window.onbeforeunload = function (e) {
    localStorage.setItem("name","close");
    return '确定离开此页吗？';
}
```



## 2. 奔溃的情况下

这个好鸡儿恼火

