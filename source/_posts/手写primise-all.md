---
title: 手写primise all
date: 2021-12-13 14:25:01
tags:
- Promise

---



## 手写Promise all

```js
// Promise all的实现
Promise._all = function (tasks) {
  return new Promise((resolve, reject) => {
    if (!tasks || !tasks.length) {
      return []
    }

    // 结果数组
    let result = [];
    // 做数量记录
    let count = 0;

    for (let i = 0; i < tasks.length; i++) {
      const element = tasks[i]; // 当前的任务
      Promise.resolve(element).then( // 需要用Promise包裹以防止当前task并不是用Promise封装的
        (data) => {
          result[i] = data;
          if (++count === tasks.length) {
            resolve(result)
          }
        },
        (err) => {
          reject(err);
          return;
        })
    }
  })
}

Promise._all([
  Promise.resolve(11211),
  Promise.resolve(21213212312),
  new Promise((resolve) => setTimeout(() => {
    resolve('延时')
  }, 1000))
]).then((data) => {
  console.log(data);
})
```

