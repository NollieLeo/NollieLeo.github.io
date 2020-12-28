---
title: 优雅的处理asnyc await
date: 2020-11-08 14:39:36
tags:
- js
- async await
categories:
- js
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

