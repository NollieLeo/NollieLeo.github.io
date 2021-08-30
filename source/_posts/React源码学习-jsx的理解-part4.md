---
title: React源码学习-jsx的理解-part4
date: 2021-08-21 22:26:48
tags:
- jsx
- React
categories:
- React
---



# jsx理解

 **`JSX`和`Fiber节点`不是同一个东西 。**

 **React Component 和 React Element 也不是一个东西。**

## 从编译来看

JSX在babel中会被编译成React.createElement（这也就是为什么需要手动`import React from 'react'`的原因了）

但是在17之后不需要手动引入了 [看这篇](https://zh-hans.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

如下图：

![image-20210822155213907](D:\Blogs\NollieLeo.github.io\source\_posts\React源码学习-jsx的理解-part4\image-20210822155213907.png)

> `JSX`并不是只能被编译为`React.createElement`方法，你可以通过[@babel/plugin-transform-react-jsx (opens new window)](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx)插件显式告诉`Babel`编译时需要将`JSX`编译为什么函数的调用（默认为`React.createElement`）。

比如在[preact (opens new window)](https://github.com/preactjs/preact)这个类`React`库中，`JSX`会被编译为一个名为`h`的函数调用。



## React.createElement

[React.createElement地址](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react/src/ReactElement.js#L348)

```js
createElement(type, config, children)
```

- type: react component类型
- config：react component 的一些属性
- children：它的子孙react component

### 执行步骤

1. 进来createElement我们会发现它定义了一些字段，这些字段都是我们比较常用的

![image-20210822155830376](D:\Blogs\NollieLeo.github.io\source\_posts\React源码学习-jsx的理解-part4\image-20210822155830376.png)

2. 之后我们对传进来的config进行校验，我们会发现他做了几个合法性的校验，并且对相对应的变量进行赋值

   - [hasValidRef](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react/src/ReactElement.js#L31)：对config中的ref做合法性校验
   - [hasValidKey](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react/src/ReactElement.js#L43)：对config中的key做合法性校验

   ![image-20210822160045714](D:\Blogs\NollieLeo.github.io\source\_posts\React源码学习-jsx的理解-part4\image-20210822160045714.png)

3. 遍历config中的属性，将除了保留属性之外的其他属性赋值给[Props](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react/src/ReactElement.js#L241)（就是内部的一个中间对象）

   [保留属性有哪些呢？](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react/src/ReactElement.js#L16)

   可以看到react把，ref，key都提出来了，单独的作为 `ReactElement`函数的参数传递（这个下面说）

4. 接下来处理type中的`defaultProps`，这里也能明白，因为我们经常需要给class的组件的一些参数设置默认的属性值

   ![image-20210822160957936](D:\Blogs\NollieLeo.github.io\source\_posts\React源码学习-jsx的理解-part4\image-20210822160957936.png)

5. 接下来我们走入`ReactElement`[函数](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react/src/ReactElement.js#L146)

   可以发现，它最终返回了一个Element对象

   ```js
   const ReactElement = function(type, key, ref, self, source, owner, props) {
       ......
     const element = {
       // 标记这是个 React Element
       $$typeof: REACT_ELEMENT_TYPE,
   
      // 这个是react component的类型   
       type: type,
       key: key,
       ref: ref,
       props: props,
       _owner: owner,
     };
   
     return element;
   };
```
   
这里要注意，其中` $$typeof`这个参数很重要，主要是用来[isValidElement](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react/src/ReactElement.js#L547)函数来判断这个element是不是合法的react element
   
   ```js
   export function isValidElement(object) {
     return (
       typeof object === 'object' &&
       object !== null &&
       object.$$typeof === REACT_ELEMENT_TYPE
     );
   }
   
   
   
   ```

> 可以看到，`$$typeof === REACT_ELEMENT_TYPE`的非`null`对象就是一个合法的`React Element`。换言之，在`React`中，所有`JSX`在运行时的返回结果（即`React.createElement()`的返回值）都是`React Element`。

## React Component

在`React`中，我们常使用`ClassComponent`与`FunctionComponent`构建组件。

```jsx
class AppClass extends React.Component {
  render() {
    return <p>111</p>
  }
}
console.log('这是ClassComponent：', AppClass);
console.log('这是Element：', <AppClass/>);


function AppFunc() {
  return <p>222</p>;
}
console.log('这是FunctionComponent：', AppFunc);
console.log('这是Element：', <AppFunc/>);
```

 我们可以从Demo控制台打印的对象看出，`ClassComponent`对应的`Element`的`type`字段为`AppClass`自身。

`FunctionComponent`对应的`Element`的`type`字段为`AppFunc`自身，如下所示：


 ```JS
{
  $$typeof: Symbol(react.element),
  key: null,
  props: {},
  ref: null,
  type: ƒ AppFunc(),
  _owner: null,
  _store: {validated: false},
  _self: null,
  _source: null 
}
 ```



## JSX与Fiber节点

从上面的内容我们可以发现，`JSX`是一种描述当前组件内容的数据结构，他不包含组件**schedule**、**reconcile**、**render**所需的相关信息。

比如如下信息就不包括在`JSX`中：

- 组件在更新中的`优先级`
- 组件的`state`
- 组件被打上的用于**Renderer**的`标记`

这些内容都包含在`Fiber节点`中。

所以，在组件`mount`时，`Reconciler`根据`JSX`描述的组件内容生成组件对应的`Fiber节点`。

在`update`时，`Reconciler`将`JSX`与`Fiber节点`保存的数据对比，生成组件对应的`Fiber节点`，并根据对比结果为`Fiber节点`打上`标记`。