---
title: 手写curry
date: 2021-12-13 11:02:58
tags:
- curry

categories:
- Javascript


---

要求实现如下

```js
const add = (a, b, c) => a + b + c;
const a1 = currying(add, 1);
const a2 = a1(2);
console.log(a2(3)) // 6
```



```js
// curry pro
function curryPro(fn, ...outerProps) {
  function curried(...middleProps) {
    const concatArr = [...middleProps];
    if (concatArr.length >= fn.length) {
      return fn.call(this, ...concatArr)
    }
    return function (...innerProps) {
      return curried.call(this, ...concatArr.concat(innerProps))
    }
  }
  if(outerProps.length){
    return curried(...outerProps);
  }
  return curried
}
```

