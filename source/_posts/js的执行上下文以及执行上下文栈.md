---
title: js的执行上下文以及执行上下文栈
date: 2021-06-05 15:37:38
tags:
- 执行上下文
- 执行上下文栈
- js
- 作用域
- 面试题
categories:
- js

---

# js的执行上下文以及执行上下文栈

## 可执行代码

js的可执行代码（executable code）有哪些？

1. 全局代码
2. 函数代码
3. eval代码

## 执行上下文

当执行到一个函数的时候这里会进行准备工作，

这个准备工作用专业点的话讲就是 **执行上下文**（execution context）

**这里一定是！函数执行的时候才会去创建执行上下文！**

对于每一个执行上下文，都有三个重要属性

- 变量对象（Variable object） 俗称VO
- 作用域链（Scope chain）
- this

这些属性可以去对应的文章中看

## 执行上下文栈

js以执行上下文栈的方式去创建一个执行上下文栈，来进行各个上下文之间的管理

在所有的情况下，执行js的代码，首先遇到的是全局代码这是毋庸置疑的

这个时候相当于这个**全局的执行上下文**就是在**栈底**了

首先我们先模拟一下，创建一个栈表示执行上下文栈

```js
ECStack = [];
```

按照上面所说的，执行上下文栈底永远都有一个全局的执行上下文，这里用globalContext表示

```js
ECStack=[
    globalContext
]
```



## 按题分析

### 解释执行上下文栈

```js
function fn3(){
    console.log('fn3')
}

function fn2(){
    console.log('fn2');
    fn3();
}

function fn1(){
    console.log('fn1');
    fn2();
}

fun1();
```

当执行一个函数的时候，就会创建一个执行上下文，并且压入执行上下文栈，当函数执行完毕的时候，就会将函数的执行上下文从栈中弹出。

因此以上的代码执行原理是这样的

```js
//fn1()
ECStack.push(<fn1> function1Context);
// 这时候发现fun1中调用了fn2
ECStack.push(<fn2> function2Context);
// fn2中又调用了fn3
ECStack.puhs(<fn3> function3Context);
// 此时的ECStack为
// ECStack = [
// 	globalContext
//  function1Context
//	function2Context
//  function3Context
// ]

//fn3执行完了
ECStack.pop(); // function3Context
// fn2执行完了
ECStack.pop(); // function3Context
// fn1执行完了
ECStack.pop(); // function1Context

// javascript接着执行下面的代码，但是ECStack底层永远有个globalContext

```



### 根据上下文栈以及作用域链以及VO或者AO分析

例如

```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();
```

```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();
```

分别输出什么？

对，都是local scope

具体分析一下

先分析第一道

#### 分析第一道

执行过程如下

1.无论如何先执行全局代码，创建全局执行上下文，全局上下文压入栈底

```js
ECStack = [
    globalContext
]
```

2.初始化全局上下文

```js
globalContext = {
    VO: [global],
    Scope: [globalContext.VO],
    this: globalContext.VO
}
```

3.在第2步初始化的过程发现全局的作用域中定义了一个 checkscrope函数，这个函数的作用域链上就会先推入一个全局上下文对象中的Scope

```js
checkscope.[[scope]]=[
    globalContext.VO
]
```

4.执行 checkscope 函数，创建 checkscope 函数执行上下文，checkscope 函数执行上下文被压入执行上下文栈 

```js
ECStack = [
    globalContext,
    checkscopeContext,
]
```

5.checkscope函数执行上下文的初始化

1. 复制函数的[[scope]]属性创建作用域链，放到checkscopeContext的[[scope]]中
2. 用arguments创建活动对象
3. 初始化活动对象，加入形参，内部函数声明，变量声明
4. 将活动对象压入 checkscope 作用域链顶端，也就是checkscope.VO
5. 函数f被声明，保存checkscope的作用域链到fn函数的[[scope]]当中

  ```js
  checkscopeContext = {
   AO:{
       arguments: {
           length: 0,
       },
       scope: undefined,
       f: refrence to function f(){}
   },
   Scope: [checkscopeContext.AO, globalContext.VO],
   this: undefined
  }
  ```

​	6. 执行函数f，创建f的执行上下文，f函数的执行上下文被压入栈中

```
ECStack= [ 
	globalContext,
	checkscopeContext,
	fnContext
]
```

7. f函数执行上下文初始化，和第5步一样

   ```js
   fnContext = {
       AO = {
       	arguments:{
       		length: 0
   		}
   	},
       Scope: [fnContext.AO, checkscopeContext.AO, globalContext.VO],
       this: undefined
   }
   ```

8. f函数执行之后，沿着**作用域链**查找到scope的值，返回scope值

9. f函数执行完，栈中pop出上下文

   ```js
   ECStack.pop()
   ```

   ```js
   ECStack = [
      	globalContext,
   	checkscopeContext, 
   ]
   ```

10. checkscope函数执行完毕，checkscope执行上下文pop出栈

    ```js
    ECStack.pop()
    ECStack = [
       	globalContext,
    ]
    ```

