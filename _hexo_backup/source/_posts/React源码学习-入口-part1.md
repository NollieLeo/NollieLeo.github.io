---
title: React源码学习
date: 2021-08-16 13:52:58
tags:
- React
categories:
- React
---

> 官方： React 是用 JavaScript 构建**快速响应**的大型 Web 应用程序的首选方式 
>
> [卡颂react深度解析](https://react.iamkasong.com/preparation/jsx.html)

> 首先学习一个框架的源码或者库的源码，我们都要从他们的入口函数出手。而react这个js库就是从ReactDOM.render入手的

## 前言：

React的快速响应是什么意思呢？

- 遇到大量计算不会让页面掉帧或者导致卡顿（这里要想到每秒60帧（HZ），每帧16.6ms）

  也就是说在一帧里头做了太多的计算工作了，这里具体要去看看浏览器渲染进程里头的js线程和GUI线程怎么做操作的，目前有一个兼容性不是很好的调度api叫做`requestIdelCallback`是用来申请浏览器调度的，但是react除了这个因为其他种种原因肯定不能用这个，所以在16之后自己实现了调度方案，也就是下面要说的`scheduler`

- 网络请求数据返回后才能进行操作，因此不能快速响应（这里涉及到用户体验上面，意思就是想要让用户把这种异步的请求，自我感知成同步的，也就是说我根本没反应过来，你这个居然就可以用了的意思）

两类对应着

- CPU的瓶颈
- IO的瓶颈

所以我们引出： react是如何从这两个方面进行优化的呢？

### CPU瓶颈

加入我们一个页面中需要一次性渲染30k个dom元素

```jsx
function App() {
  const len = 3000;
  return (
    <ul>
      {Array(len).fill(0).map((_, i) => <li>{i}</li>)}
    </ul>
  );
}

const rootEl = document.querySelector("#root");
ReactDOM.render(<App/>, rootEl); 
```



而大部分目前设备浏览器刷新比率都是60HZ（每秒60帧），16.6ms刷新一帧

而， JS可以操作DOM，`GUI渲染线程`与`JS线程`是互斥的， **JS脚本执行**和**浏览器布局、绘制**不能同时执行。 

 在每16.6ms时间内，需要完成如下工作： 

```
JS脚本执行 -----  样式布局 ----- 样式绘制
```

当JS执行时间过长，超出了16.6ms，这次刷新就没有时间执行**样式布局**和**样式绘制**了。

在Demo中，由于组件数量繁多（3000个），JS脚本执行时间过长，页面掉帧，造成卡顿。

可以从打印的执行堆栈图看到，JS执行时间为73.65ms，远远多于一帧的时间

 ![长任务](https://react.iamkasong.com/img/long-task.png) 

如何解决这个问题呢？

答案是：在浏览器每一帧的时间中，预留一些时间给JS线程，`React`利用这部分时间更新组件（可以看到，在[源码 (opens new window)](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/scheduler/src/forks/SchedulerHostConfig.default.js#L119)中，预留的初始时间是5ms）。

当预留的时间不够用时，`React`将线程控制权交还给浏览器使其有时间渲染UI，`React`则等待下一帧时间到来继续被中断的工作。

> 这种将长任务分拆到每一帧中，像蚂蚁搬家一样一次执行一小段任务的操作，被称为`时间切片`（time slice）

接下来我们开启`Concurrent Mode`

```jsx
// 通过使用ReactDOM.unstable_createRoot开启Concurrent Mode
// ReactDOM.render(<App/>, rootEl);  
ReactDOM.unstable_createRoot(rootEl).render(<App/>);
```

此时我们的长任务被拆分到每一帧不同的`task`中，`JS脚本`执行时间大体在`5ms`左右，这样浏览器就有剩余时间执行**样式布局**和**样式绘制**，减少掉帧的可能性。

 ![长任务](https://react.iamkasong.com/img/time-slice.png) 

 所以，解决`CPU瓶颈`的关键是实现`时间切片`，而`时间切片`的关键是：将**同步的更新**变为**可中断的异步更新**。 

### IO瓶颈

`网络延迟`是前端开发者无法解决的。如何在`网络延迟`客观存在的情况下，减少用户对`网络延迟`的感知？

`React`给出的答案是[将人机交互研究的结果整合到真实的 UI 中 (opens new window)](https://zh-hans.reactjs.org/docs/concurrent-mode-intro.html#putting-research-into-production)。

这里我们以业界人机交互最顶尖的苹果举例，在IOS系统中：

点击“设置”面板中的“通用”，进入“通用”界面：

 ![同步](https://react.iamkasong.com/img/legacy-move.gif) 

作为对比，再点击“设置”面板中的“Siri与搜索”，进入“Siri与搜索”界面：

 ![异步](https://react.iamkasong.com/img/concurrent-mov.gif) 

事实上，点击“通用”后的交互是同步的，直接显示后续界面。而点击“Siri与搜索”后的交互是异步的，需要等待请求返回后再显示后续界面。但从用户感知来看，这两者的区别微乎其微。

这里的窍门在于：点击“Siri与搜索”后，先在当前页面停留了一小段时间，这一小段时间被用来请求数据。

当“这一小段时间”足够短时，用户是无感知的。如果请求时间超过一个范围，再显示`loading`的效果。

试想如果我们一点击“Siri与搜索”就显示`loading`效果，即使数据请求时间很短，`loading`效果一闪而过。用户也是可以感知到的。

为此，`React`实现了[Suspense (opens new window)](https://zh-hans.reactjs.org/docs/concurrent-mode-suspense.html)功能及配套的`hook`——[useDeferredValue (opens new window)](https://zh-hans.reactjs.org/docs/concurrent-mode-reference.html#usedeferredvalue)。

而在源码内部，为了支持这些特性，同样需要将**同步的更新**变为**可中断的异步更新**。

###  总结

通过以上内容，我们可以看到，`React`为了践行“构建**快速响应**的大型 Web 应用程序”理念做出的努力。

其中的关键是解决CPU的瓶颈与IO的瓶颈。而落实到实现上，则需要将**同步的更新**变为**可中断的异步更新**。



## 新老React架构对比（15 vs 16++）

> 为什么react16要对15进行内部重构呢？



## Fiber架构

[官方回答什么是fiber](https://github.com/acdlite/react-fiber-architecture)