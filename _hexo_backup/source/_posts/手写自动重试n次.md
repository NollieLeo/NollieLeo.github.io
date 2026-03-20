---
title: 手写自动重试n次
date: 2023-02-24 17:55:50
tags:
  - Javascript
categories:
  - Javascript
  - Promise
---

请求失败的时候自动重试，这里默认2次重试

```js
function retry(promiseFn, times = 2) {
  let count = 0;

  function handleRetry(res, rej) {
    return new Promise((resolve = res, reject = rej) => {
      promiseFn()
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          if (count === times || !times) {
            reject(err);
          } else {
            count++;
            handleRetry(resolve, reject);
          }
        });
    });
  }

  return handleRetry();
}

let mark = 0;

function test() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      mark++;
      if (mark === 10) {
        resolve("成功resolve");
        console.log("成功了");
      } else {
        reject("error");
        console.log("失败了");
      }
    }, 500);
  });
}

retry(test, 5)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
```
