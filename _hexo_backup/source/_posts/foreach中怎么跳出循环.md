---
title: forEach中怎么跳出循环
date: 2021-06-16 16:41:03
tags:
- forEach
- Javascript
- trycatch
categories:
- Javascript

---

总所周知：forEach是不可以跳出循环的，所以应该想办法给他跳出去



## 1. forEach中写try catch

 使用try监视代码块，在需要中断的地方抛出异常。 

```js
let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  arr.forEach((value) => {
    try {
      if (!(value % 2)) {
        throw '';
      } else {
        console.log(value);
      }
    } catch (error) {
      throw error
    }
});
```



## 2. 替换方法（使用every或者some替换）

官方推荐方法（替换方法）：用every和some替代forEach函数。every在碰到return false的时候，中止循环。some在碰到return true的时候，中止循环 

```js
let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    arr.some((item) => {
        if (item % 2) {
            console.log(item);
            return false;
        }
    return true;
});
```

```js
let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    arr.every((item) => {
        if (item % 2) {
          console.log(item);
          return true;
        }
    return false;
});
```

