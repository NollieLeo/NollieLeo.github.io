---
title: 手写获取url上的query参数
date: 2023-03-02 21:49:11
tags:
  - Javascript
categories:
  - Javascript
---

就如下:

```js
function urlHandler(url) {
  const idx = url.indexOf("?");

  let result = {};

  if (idx > -1) {
    const params = url.slice(idx + 1).split("&");

    params.forEach((paramQuery) => {
      const [name, value] = paramQuery.split("=");
      const decodeVal = decodeURIComponent(value);
      if (result[name] !== undefined) {
        if (Array.isArray(result[name])) {
          result[name].push(decodeVal);
        } else {
          result[name] = [result[name], decodeVal];
        }
      } else {
        result[name] = decodeVal;
      }
    });
  }

  return result;
}

console.log(
  urlHandler(
    "https://juejin.cn/post/6979775184911728671?name=%E6%88%91%E6%98%AF%E4%BD%A0%E7%88%B8%E7%88%B8"
  )
);
```
