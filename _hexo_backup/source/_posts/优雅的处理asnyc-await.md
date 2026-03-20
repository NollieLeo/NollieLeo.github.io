---
title: 优雅的处理asnyc await
date: 2020-11-08 14:39:36
tags:
- Javascript
- async await
categories:
- Javascript
---



上代码

```js

const errorCaptured = async (asyncFunc) => {
  try {
    const res = await asyncFunc();
    return [null, res];
  } catch (error) {
    return [error, null];
  }
};
```

