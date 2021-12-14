---
title: 手写promise race
date: 2021-12-13 15:59:30
tags:
- Promise

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

