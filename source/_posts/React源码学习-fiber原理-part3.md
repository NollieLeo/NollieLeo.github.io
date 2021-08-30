---
title: React源码学习-fiber原理-part3
date: 2021-08-21 17:17:17
tags:
- React
- React fiber
categories:
- React
---



# Fiber架构

[官方回答什么是fiber](https://github.com/acdlite/react-fiber-architecture)

`Fiber`并不是计算机术语中的新名词，他的中文翻译叫做`纤程`，与进程（Process）、线程（Thread）、协程（Coroutine）同为程序执行过程。

在很多文章中将`纤程`理解为`协程`的一种实现。在`JS`中，`协程`的实现便是`Generator`。

所以，我们可以将`纤程`(Fiber)、`协程`(Generator)理解为`代数效应`思想在`JS`中的体现。

**`React Fiber`可以理解为**：

`React`内部实现的一套状态更新机制。支持任务不同`优先级`，可中断与恢复，并且恢复后可以复用之前的`中间状态`。

其中每个任务**更新单元**为`React Element`对应的`Fiber节点`。

## Fiber架构心智模型

 React核心团队成员[Sebastian Markbåge (opens new window)](https://github.com/sebmarkbage/)（`React Hooks`的发明者）曾说：我们在`React`中做的就是践行`代数效应`（Algebraic Effects）。 

### 代数效应

[这篇文章可以好好看看](https://blog.csdn.net/qq_36968599/article/details/114851241)

 `代数效应`能够将`副作用`从函数逻辑中分离，使函数关注点保持纯粹。 

就比如我们平时用await来等待一个值的返回

```js
async function getData(){
    const res = await loadData();
    return res;
}
```

代数效应相当于，我关注的是 await loadData()能给我什么东西，而不是关注他里头是异步还是同步，怎么处理这个数据的；

### 代数效应 in React

在react中有个结合Suspense的例子

[Suspense Demo](https://codesandbox.io/s/frosty-hermann-bztrp?file=/src/index.js:152-160)

而我们日常用hooks，例如useState什么的，我们不需要关注函数组件的这个state状态是怎么处理的，我们只要知道这个东西能干嘛就行。

### 为什么不用Generator

新老架构那片说过，React16之后引入了一个 **scheduler（调度器）**，并且重构了**Reconciler**（协调器），就是为了将react的老一套同步更新 的架构变成 **异步可中断 **的

`异步可中断更新`可以理解为：`更新`在执行过程中可能会被打断（浏览器时间分片用尽或有**更高优任务插队**），当可以继续执行时恢复之前执行的中间状态。

**缺点：**

- `generator`它具有传染性和async await一样，就像你用async的函数那东西，你需要写await一样
- 中间状态上下文相关，可以看看这个 [解释](https://github.com/facebook/react/issues/7942#issuecomment-254987818)



## Fiber实现原理

### Fiber含义

首先我们要明白：

1. react15的时候采用递归方式去执行，数据保存在递归调用栈中，故被称为`stack reconciler`
2. react16 的reconciler 基于 `fiber节点`实现的，故称为 `fiber reconciler`
3. 一个 `React Element` 对应一个`Fiber`节点
   - 作为静态结构理解 --- 保存了该组件类型（原生/类组件/函数组件/...），以及对应dom节点信息
   - 作为动态结构理解 --- 每个`Fiber`保存了本次更新中该组件改变的状态，要执行的工作（插入/删除/更新...）

### Fiber数据结构

[Fiber数据结构](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiber.new.js#L117)

```js
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // 作为静态数据结构的属性
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // 用于连接其他Fiber节点形成Fiber树
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  // 作为动态的工作单元的属性
  this.effectTag = NoEffect;
  this.subtreeTag = NoSubtreeEffect;
  this.deletions = null;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  // 调度优先级相关
  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  // 指向该fiber在另一次更新时对应的fiber， current tree中的fiber节点和workinprogress tree的fiber节点连接
  this.alternate = null;
  }
```

#### Fiber节点之间关系

`Fiber`节点之间是通过以下三个属性建立起连接的

```js
// 指向父级Fiber节点
this.return = null;
// 指向子Fiber节点
this.child = null;
// 指向右边第一个兄弟Fiber节点
this.sibling = null;
```

比如下面的代码和对应的Fiber树如下：

```jsx
function App(){
    return (
    	<div>
        	<span>hello world</span>
            <a>
                weng
                <span/>
            </a>
        </div>
    )
}

```

![image-20210821213628488](image-20210821213628488.png)

> 这里需要提一下，为什么父级指针叫做`return`而不是`parent`或者`father`呢？因为作为一个工作单元，`return`指节点执行完`completeWork`（后面会说）后会返回的下一个节点。子`Fiber节点`及其兄弟节点完成工作后会返回其父级节点，所以用`return`指代父级节点。

#### 作为静态的数据结构

作为一种静态的数据结构，保存了组件相关的信息：

```js
// Fiber对应组件的类型 Function/Class/Host...
this.tag = tag;
// key属性
this.key = key;
// 大部分情况同type，某些情况不同，比如FunctionComponent使用React.memo包裹
this.elementType = null;
// 对于 FunctionComponent，指函数本身，对于ClassComponent，指class，对于HostComponent，指DOM节点tagName
this.type = null;
// Fiber对应的真实DOM节点
this.stateNode = null;
```

#### 作为动态的工作单元

作为动态的工作单元，`Fiber`中如下参数保存了本次更新相关的信息，我们会在后续的更新流程中使用到具体属性时再详细介绍

```js
// 保存本次更新造成的状态改变相关信息
this.pendingProps = pendingProps;
this.memoizedProps = null;
this.updateQueue = null;
this.memoizedState = null;
this.dependencies = null;

this.mode = mode;

// 保存本次更新会造成的DOM操作
this.effectTag = NoEffect;
this.nextEffect = null;

this.firstEffect = null;
this.lastEffect = null;
```

如下两个字段保存调度优先级相关的信息，会在学习`Scheduler`时说

```js
// 调度优先级相关
this.lanes = NoLanes;
this.childLanes = NoLanes;
```



## Fiber工作原理

首先，上面说了，Fiber节点直接会构成一棵Fiber树，并且存有节点以及各种信息每个Fiber。

所以一个Fiber是根据一个dom或者说React Element的出来的，那么树的结构也和dom或者组件树相同。

主要 **更新** 工作原理，这里用到了一个叫做 **双缓存**的技术

### what is 双缓存？

当我们用`canvas`绘制动画，每一帧绘制前都会调用`ctx.clearRect`清除上一帧的画面。

如果当前帧画面计算量比较大，导致清除上一帧画面到绘制当前帧画面之间有较长间隙，就会出现白屏。

为了解决这个问题，我们可以在内存中绘制当前帧动画，绘制完毕后**直接用当前帧替换**上一帧画面，由于省去了两帧替换间的计算时间，不会出现从白屏到出现画面的闪烁情况。

这种**在内存中构建并直接替换**的技术叫做[双缓存 ](https://baike.baidu.com/item/双缓冲)。

`React`使用“双缓存”来完成`Fiber树`的构建与替换——对应着`DOM树`的创建与更新。

### Fiber树和双缓存

> React中最多会同时存在两棵Fiber树

1. `Current Fiber` 树：当前显示在屏幕面前的树
2.  `workInProgress Fiber` 树：正在内存中构建的树



 `current Fiber树`中的`Fiber节点`被称为`current fiber`，`workInProgress Fiber树`中的`Fiber节点`被称为`workInProgress fiber`，他们通过`alternate`属性连接。 

```js
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

`React`应用的根节点通过使`current`指针在不同`Fiber树`的`rootFiber`间切换来完成`current Fiber`树指向的切换。 

即当`workInProgress Fiber树`构建完成交给`Renderer`渲染在页面上后，应用根节点的`current`指针指向`workInProgress Fiber树`，此时`workInProgress Fiber树`就变为`current Fiber树`。

每次状态更新都会产生新的`workInProgress Fiber树`，通过`current`与`workInProgress`的替换，完成`DOM`更新。



#### mount时候

考虑如下例子：

```js
function App() {
  const [num, add] = useState(0);
  return (
    <p onClick={() => add(num + 1)}>{num}</p>
  )
}

ReactDOM.render(<App/>, document.getElementById('root'));
```

1. 首次执行`ReactDOM.render`会创建`fiberRootNode`（源码中叫`fiberRoot`）和`rootFiber`。其中`fiberRootNode`是整个应用的根节点，`rootFiber`是``所在组件树的根节点。

之所以要区分`fiberRootNode`与`rootFiber`，是因为在应用中我们可以多次调用`ReactDOM.render`渲染不同的组件树，他们会拥有不同的`rootFiber`。但是整个应用的根节点只有一个，那就是`fiberRootNode`。

`fiberRootNode`的`current`会指向当前页面上已渲染内容对应`Fiber树`，即`current Fiber树`。

![rootFiber](https://react.iamkasong.com/img/rootfiber.png)

由于是**首屏渲染**，页面中还没有挂载任何`DOM`，所以`fiberRootNode.current`指向的`rootFiber`没有任何`子Fiber节点`（即`current Fiber树`为空）。

1. 接下来进入`render阶段`，根据组件返回的`JSX`在内存中依次创建`Fiber节点`并连接在一起构建`Fiber树`，被称为`workInProgress Fiber树`。（下图中右侧为内存中构建的树，左侧为页面显示的树）

在构建`workInProgress Fiber树`时会尝试复用`current Fiber树`中已有的`Fiber节点`内的属性，在`首屏渲染`时只有`rootFiber`存在对应的`current fiber`（即`rootFiber.alternate`）。

![workInProgressFiber](https://react.iamkasong.com/img/workInProgressFiber.png)

 ![workInProgressFiberFinish](https://react.iamkasong.com/img/wipTreeFinish.png)

#### update时

1. 接下来我们点击`p节点`触发状态改变，这会开启一次新的`render阶段`并构建一棵新的`workInProgress Fiber 树`。

![wipTreeUpdate](https://react.iamkasong.com/img/wipTreeUpdate.png)

> 这个决定是否复用的过程就是Diff算法，后面会说

1. `workInProgress Fiber 树`在`render阶段`完成构建后进入`commit阶段`渲染到页面上。**渲染完毕后**，`workInProgress Fiber 树`变为`current Fiber 树`。

![currentTreeUpdate](https://react.iamkasong.com/img/currentTreeUpdate.png)

# 查看源码中的FiberRootNode

上面曾说到，我们首次创建react的应用的时候会创建整个应用的一个根节点 叫做 `FiberRootNode`

然后每次调用render方法都会创建当前组件的一个根节点叫做 `rootFiber`

这里我们验证以下这个 `FiberRootNode`

![image-20210821223750870](image-20210821223750870.png)

图中圈出的部分就是react应用首次运行时候，创建一个**应用根节点`FiberRootNode`**的过程

我们顺着调用栈找到这个创建的调用方法 creatFiberRoot --- createFiber（创建应用根的方法）

![image-20210821224000472](image-20210821224000472.png)



找到源码，打个断点

![image-20210822153431608](image-20210822153431608.png)

刷新页面之后

![image-20210822153527527](image-20210822153527527.png)

发现首次渲染，创建fiberRoot节点，这个tag为3，那么代表什么意思呢？

我们可以在它右边的调用栈中找到上层函数`createHostRootFiber`

![image-20210822153638347](image-20210822153638347.png)

其实发现这个tag，也就是这里的HostRoot值为3