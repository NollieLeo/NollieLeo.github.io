---
title: 手写promise race
published: 2021-12-13T15:59:30.000Z
description: >-
  Promise Race  js // Promise race实现 Promise._race = function (taskArr) {  
  return new Promise((resolve, reject) = {     for (const iterator of
  taskArr)...
tags:
  - Promise
category: Javascript
---



## Promise Race

```js
// Promise race实现
Promise._race = function (taskArr) {
  return new Promise((resolve, reject) => {
    for (const iterator of taskArr) {
      Promise.resolve(iterator).then((data) => {
        resolve(data);
      }, (err) => {
        reject(err);
        return
      })
    }
  })
}
```

