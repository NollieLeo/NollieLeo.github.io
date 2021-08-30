---
title: React源码学习-render阶段-part5
date: 2021-08-22 17:44:31
tags:
- React
- React render
categories:
- React
---

> 之前fiber那边说过，当我们第一次创建完了整个应用的根节点（fiberRootNode的时候，我们就进入首屏渲染的阶段）

通过sheduleUpdateOnFiber去调度更新，调度成功之后会走`performSyncWorkOnRoot`，也就是说从根节点开始执行这次的更新。

这时候也肯定是没有一个workInProgress的fiber tree的，所以从根节点出发，去触发更新（第一次构建tree）操作

![image-20210822213436338](D:\Blogs\NollieLeo.github.io\source\_posts\React源码学习-render阶段-part5\image-20210822213436338.png)

协调器工作主要是入口是 workSyncLoop，递阶段开始于某个fiber其beginWork，归阶段则是调用completeWork

这里我们说一下协调器的工作，渲染器后面讲（渲染器这里我们只要知道它是将变化的节点渲染到视图上，所以分为渲染到**视图-之前-中-之后**）

![image-20210822215752746](D:\Blogs\NollieLeo.github.io\source\_posts\React源码学习-render阶段-part5\image-20210822215752746.png)

> 因此协调器工作开始到结束，我们称呼为 **`render`阶段，**
>
> 渲染器开始到结束，称呼为`commit`阶段
>
> 整个流程就是首屏渲染了

# render阶段

## 流程概览

首先我们先看调用栈里头render阶段是从哪里开始的呢？

![image-20210822181130206](D:\Blogs\NollieLeo.github.io\source\_posts\React源码学习-render阶段-part5\React源码学习-render阶段-part5.md)

`render阶段`开始于`performSyncWorkOnRoot`或`performConcurrentWorkOnRoot`方法的调用。这取决于本次更新是同步更新还是异步更新。

之后调用`workSyncLoop`或者`workLoopConcurrent`

```js
// performSyncWorkOnRoot会调用该方法
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

// performConcurrentWorkOnRoot会调用该方法
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

上面所说的workInProgress tree构建的过程从这里正式开始

代码中的workInProgress 代表的是当前已经创建的`workInProgress Fiber`

 `performUnitOfWork`方法会创建下一个`Fiber节点`并赋值给`workInProgress`，并将`workInProgress`与已创建的`Fiber节点`连接起来构成`Fiber树`。 

我们知道`Fiber Reconciler`是从`Stack Reconciler`重构而来，通过遍历的方式实现可中断的递归

所以具体我们看看`performUnitOfWork`的工作可以分为两部分：**“递”和“归”**。



### ”递“阶段

 首先从`rootFiber`开始向下深度优先遍历。为遍历到的每个`Fiber节点`调用[beginWork方法](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L3058)

该方法会根据传入的`Fiber节点`创建`子Fiber节点`，并将这两个`Fiber节点`连接起来。

当遍历到叶子节点（即没有子组件的组件）时就会进入“归”阶段。

### “归”阶段

在“归”阶段会调用[completeWork](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L652)处理`Fiber节点`。

当某个`Fiber节点`执行完`completeWork`，如果其存在`兄弟Fiber节点`（即`fiber.sibling !== null`），会进入其`兄弟Fiber`的“递”阶段。

如果不存在`兄弟Fiber`，会进入`父级Fiber`的“归”阶段。

“递”和“归”阶段会交错执行直到“归”到`rootFiber`。至此，`render阶段`的工作就结束了。



### 总结

总体来说递归阶段是下面这段伪代码描述的一样

```js
function performUnitOfWork(fiber) {
  // 执行beginWork

  if (fiber.child) {
    performUnitOfWork(fiber.child);
  }

  // 执行completeWork

  if (fiber.sibling) {
    performUnitOfWork(fiber.sibling);
  }
}
```



> 根据Fiber的那一讲解咱们可以知道，我们的react中可以最多存在两棵fiber树，一个是workInProgress一个是current，咱们在首次mount的时候是，是没有current的，只是在内存中通过整个应用的根fiberRootNode去构建workinprogess tree
>
> 之后update的时候是存在current的tree的
>
> 所以这两个阶段的“递”和“归”流程是各不一样的
>
> 因此我们接下来按照 mount 和update触发去解释“递归”