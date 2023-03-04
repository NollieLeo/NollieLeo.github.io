---
title: 手写sleep函数
date: 2023-02-24 21:32:29
tags:
  - Javascript
categories:
  - Javascript
---

手动实现一个 sleep 函数

## 通过 while 实现

```js
function sleep(time) {
  const startTime = Date.now();

  while (Date.now() - startTime < time) {
    continue;
  }
}

console.log("start");
sleep(2000);
console.log("end");
```

## async await

```js
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

async function test() {
  console.log("start");
  await sleep(2000);
  console.log("end");
}

test();
```
