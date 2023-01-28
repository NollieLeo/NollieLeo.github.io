---
title: 手写compose
date: 2021-12-13 10:40:26
tags:
- compose
categories:
- Javascript
---

## compose简介

compose就是执行一系列的任务（函数），比如有以下任务队列

```js
let tasks = [step1, step2, step3, step4]

```

每一个step都是一个步骤，按照步骤一步一步的执行到结尾，这就是一个**compose**

compose在函数式编程中是一个很重要的工具函数，在这里实现的compose有三点说明

- 第一个函数是多元的（接受多个参数），后面的函数都是单元的（接受一个参数）
- 执行顺序的自右向左的
- 所有函数的执行都是同步的

还是用一个例子来说，比如有以下几个函数

```js
let init = (...args) => args.reduce((ele1, ele2) => ele1 + ele2, 0)
let step2 = (val) => val + 2
let step3 = (val) => val + 3
let step4 = (val) => val + 4
```

这几个函数组成一个任务队列

```js
steps = [step4, step3, step2, init]
```

使用compose组合这个队列并执行

```js
let composeFunc = compose(...steps)

console.log(composeFunc(1, 2, 3))
```

执行过程

```
6 -> 6 + 2 = 8 -> 8 + 3 = 11 -> 11 + 4 = 15
```

所以流程就是从init自右到左依次执行，下一个任务的参数是上一个任务的返回结果，并且任务都是同步的，这样就能保证任务可以按照有序的方向和有序的时间执行。



## 手写

```js
// compose
function compose(...args) {
  const fnArr = Array.from(args);
  let result;
  return function composer(...rest) {
    const current = fnArr.shift();
    result = current.call(this, ...rest);
    if (!fnArr.length) {
      return result
    }
    return composer(result)
  }
}
```



