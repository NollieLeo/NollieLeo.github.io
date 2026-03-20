---
title: 手写promise allSettled
published: 2021-12-13T16:06:06.000Z
description: >-
  Promise allSettled    js // Promise allSettled Promise._allSettled = function
  (taskArr) {   return new Promise((resolve, reject) = {     const result ...
tags:
  - Promise
  - Javascript
category: Javascript
---



## Promise allSettled



```js
// Promise allSettled
Promise._allSettled = function (taskArr) {
  return new Promise((resolve, reject) => {
    const result = []; // 结果数组
    let count = 0;  // 计数，当count等于taskArr的长度的时候，说明都处理完这些promise了
    taskArr.forEach((task, index) => {
      if (!(task instanceof Promise)) task = Promise.resolve(task);
      task.then((value) => {
        result[index] = {
          status: 'fullfilled',
          value
        }
        count++;
        if (count === taskArr.length) {
          resolve(result)
        }
      }, (reason) => {
        result[index] = {
          status: 'rejected',
          reason
        }
        count++;
        if (count === taskArr.length) {
          resolve(result)
        }
      })
    })
  })
}

Promise._allSettled([
  () => '我不是一个promise',
  Promise.resolve(12121),
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('motherfucker')
    }, 4000);
  }),
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('hello')
    }, 3000);
  })
]).then((data) => {
  console.log(data);
})
```

