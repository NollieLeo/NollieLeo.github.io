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



## 实现

```js
function _instanceof(obj, fn){
    let proto = obj.__proto__;
    let prototype = fn.prototype;
    while(true){
      if(prototype === null){
        return false;
      }
      if(proto === prototype){
        return true;
      }
      proto = prototype.__proto__;
    }
}
```

首先将实例的`[[Prototype]]`指针赋值给proto对象，这里指向的是此对象构造函数的原型

之后将构造函数的原型赋值给prototype，这里要排除原型指向null的情况；

之后不断的循环，将原型的原型付给prototype，一层层向上查找，直到等于proto或者为null的情况下退出循环

因为`Object.prototype.__proto__`是指向null的，所以到这里还找不到，那就说明目标构造函数不在原型链上面





## 测试

```js
function BasePerson(){}
function Person(){}

Person.prototype = new BasePerson(); // 这里使用继承

const a = new Person();

console.log(_instanceof(a, Person)) // true

console.log(_instanceof(a, BasePerson)) // true
```

