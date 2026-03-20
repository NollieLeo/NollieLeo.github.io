---
title: react何时render呢？
date: 2020-12-24 09:50:41
tags:
- React
- React render
categories:
- React
---

对于如下Demo，点击`Parent`组件的`div`，触发更新，`Son`组件会打印`child render!`么？

```tsx
function Son() {  
    console.log('child render!');  
    return <div>Son</div>;
}
function Parent(props) {  
    const [count, setCount] = React.useState(0);  
    return (    
        <div onClick={() => {setCount(count + 1)}}>      
            count:{count}      
            {props.children}    
        </div>  
    );
}
function App() {  
    return (    
        <Parent>      
            <Son/>    
        </Parent>  
    );
}
const rootEl = document.querySelector("#root");
ReactDOM.render(<App/>, rootEl);
```

```
                                                不会    
```

## render需要满足的条件

`React`创建`Fiber树`时，每个组件对应的`fiber`都是通过如下两个逻辑之一创建的：

- render。即调用`render`函数，根据返回的`JSX`创建新的`fiber`。
- bailout。即满足一定条件时，`React`判断该组件在更新前后没有发生变化，则复用该组件在上一次更新的`fiber`作为本次更新的`fiber`。

可以看到，当命中`bailout`逻辑时，是不会调用`render`函数的。

所以，`Son`组件不会打印`child render!`是因为命中了`bailout`逻辑。

## bailout需要满足的条件

什么情况下会进入`bailout`逻辑？当同时满足如下4个条件时：

### 1. oldProps === newProps ？

即本次更新的`props`（newProps）不等于上次更新的`props`（oldProps）。

注意这里是**全等比较**。

我们知道组件`render`会返回`JSX`，`JSX`是`React.createElement`的语法糖。

所以`render`的返回结果实际上是`React.createElement`的执行结果，即一个包含`props`属性的对象。

即使本次更新与上次更新`props`中每一项参数都没有变化，但是本次更新是`React.createElement`的执行结果，是一个全新的`props`引用，所以`oldProps !== newProps`。

如果我们使用了`PureComponent`或`Memo`，那么在判断是进入`render`还是`bailout`时，不会判断`oldProps`与`newProps`是否全等，而是会对`props`内每个属性进行浅比较。

### 2. context没有变化

即`context`的`value`没有变化。

### 3. workInProgress.type === current.type ？

更新前后`fiber.type`是否变化，比如`div`是否变为`p`。

### 4. !includesSomeLane(renderLanes, updateLanes) ？

当前`fiber`上是否存在`更新`，如果存在那么`更新`的`优先级`是否和本次整棵`fiber树`调度的`优先级`一致？

如果一致则进入`render`逻辑。

就我们的Demo来说，`Parent`是整棵树中唯一能触发`更新`的组件（通过调用`setCount`）。

所以`Parent`对应的`fiber`是唯一满足条件4的`fiber`。

## Demo的详细执行逻辑

所以，Demo中`Son`进入`bailout`逻辑，一定是同时满足以上4个条件。我们一个个来看。

条件2，Demo中没有用到`context`，满足。

条件3，更新前后`type`都为`Son`对应的函数组件，满足。

条件4，`Son`本身无法触发更新，满足。

所以，重点是条件1。让我们详细来看下。

本次更新开始时，`Fiber树`存在如下2个`fiber`：

```
FiberRootNode      
	|  
RootFiber      
```

其中`FiberRootNode`是整个应用的根节点，`RootFiber`是调用`ReactDOM.render`创建的`fiber`。

首先，`RootFiber`会进入`bailout`的逻辑，所以返回的`App fiber`和更新前是一致的。

```
FiberRootNode      
	|  
RootFiber           
	| 
App fiber
```

由于`App fiber`是`RootFiber`走`bailout`逻辑返回的，所以对于`App fiber`，`oldProps === newProps`。并且`bailout`剩下3个条件也满足。

所以`App fiber`也会走`bailout`逻辑，返回`Parent fiber`。

```
FiberRootNode      
	|  
RootFiber           
	|   
App fiber      
	| 
Parent fiber
```

由于更新是`Parent fiber`触发的，所以他不满足条件4，会走`render`的逻辑。

**接下来是关键**

如果`render`返回的`Son`是如下形式：

```
<Son/>
```

会编译为

```
React.createElement(Son, null)
```

执行后返回`JSX`。

由于`props`的引用改变，`oldProps !== newProps`。会走`render`逻辑。

但是在Demo中`Son`是如下形式：

```
{props.children}
```

其中，`props.children`是`Son`对应的`JSX`，而这里的`props`是`App fiber`走`bailout`逻辑后返回的。

所以`Son`对应的`JSX`与上次更新时一致，`JSX`中保存的`props`也就一致，满足条件1。

可以看到，`Son`满足`bailout`的所有条件，所以不会`render`。