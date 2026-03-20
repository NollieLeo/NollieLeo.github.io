---
title: 优雅的处理asnyc await
published: 2020-11-08T14:39:36.000Z
description: >-
  上代码  js  const errorCaptured = async (asyncFunc) = {   try {     const res =
  await asyncFunc();     return [null, res];   } catch (error) {     return...
tags:
  - JavaScript
  - async await
category: "前端开发"
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

