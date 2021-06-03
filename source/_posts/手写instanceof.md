---
title: 手写instanceof
date: 2021-06-02 17:45:33
tags:
- js
- 原型
- 原型链
- instanceof
- 面试题
categories:
- js

---

# 手写instanceof

> **`instanceof`** **运算符**用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上。

## 原理

`instanceof` 运算符用来检测 `constructor.prototype `是否存在于参数 `object` 的原型链上。

就是找对象原型链上是否有某个构造函数的原型

```js
function _instanceof(object, fn){
    
}
```

