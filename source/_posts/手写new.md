---
title: 手写new
date: 2021-06-01 15:27:54
tags:
- new
- Javascript
- 构造函数
- 面试题
categories:
- Javascript

---



# 手写new操作符

要手写new的操作实现

必须先了解new的过程发生了什么

1. 创建一个新得对象（obj）
2.  将新对象的`__proto__`指向构造函数的`prototype` 
3. 将构造函数的this执行这个新对象（obj）
4. 执行构造函数中的代码(为这个新对象添加属性和方法);
5. 返回这个新对象;（这里构造函数可能会显式返回值，得做处理，可以看看 构造函数返回值 那篇文章）



总结就是需要实现以下的功能：

1. 让实例可以访问到私有的属性
2. 实例可以访问到构造函数原型所在链上的属性（也就是原型链）
3. 针对构造函数显式返回的值做处理



## 步骤

首先先写出一个叫做 _new的函数，类似构造函数的传参形式

structFn: 函数

args: 给构造函数传的参数

```js
function _new(structFn, ...args){
}
```

### 1.  第一个参数类型判断
structFn 指的就是构造函数，首先明白一点，new操作符后头只能够跟随函数，要先做类型判断(ES6中的class也是一样的)

```js
function _new(structFn, ...args) {
    if (typeof structFn !== "function") {
      throw 'structFn must be a function'
    }
}
```

### 2. 创建新对象，并且克隆构造函数的原型，将原型赋值给新对象的`[[Prototype]]`指针

```js
function _new(structFn, ...args) {
    if (typeof structFn !== "function") {
      throw 'structFn must be a function'
    }
    let obj = new Object;
    obj.__proto__ = Object.create(structFn.prototype);
}
```



### 3. 执行构造函数中的初始化逻辑，并且将this指向新对象

这里声明res变量，将构造函数的this指向了新对象，并且将args剩余参数传入构造函数，保存执行构造函数之后返回值存在res

```js
function _new(structFn, ...args) {
    if (typeof structFn !== "function") {
      throw "structFn must be a function";
    }
    let obj = new Object();
    obj.__proto__ = Object.create(structFn.prototype);
    let res = fn.call(obj, ...args);
}
```



### 4. 对构造函数执行之后的返回值做处理

因为根据构造函数的返回值情况来看，比较值得注重的就是返回一个引用类型的时候，和返回null 以及基本数据类型的时候区别，引用类型（比如new String() new Object() {} new Number() 这些的）就直接返回了，null以及基本数据类型就默认返回this

```js
  function _new(structFn, ...args) {
    if (typeof structFn !== "function") {
      throw "structFn must be a function";
    }
    let obj = new Object();
    obj.__proto__ = Object.create(structFn.prototype);
    let res = fn.call(obj, ...args);
    const isObject = typeof res === "object" && res !== null;
    const isFunction = typeof res === "function";
    return isFunction || isObject ? res : obj;
  }
```

这里通过isObject和isFunction来确定返回值的类型



## 测试

首先检测一下

```js
  function _new(structFn, ...args) {
    if (typeof structFn !== "function") {
      throw "structFn must be a function";
    }
    let obj = new Object();
    obj.__proto__ = Object.create(structFn.prototype);
    let res = structFn.call(obj, ...args);
    const isObject = typeof res === "object" && res !== null;
    const isFunction = typeof res === "function";
    return isFunction || isObject ? res : obj;
  }

  function Person(name) {
    this.name = name;
  }

  const per1 = _new(Person, 'weng');

  const per2 = new Person('weng');

  console.log(per1);
  console.log(per2);
```

这里分别打印出使用 new操作符和_new函数的实例

![image-20210601175133106](image-20210601175133106.png)

这里会发现，我们自己写的_new操作函数得出的实例`[[Prototype]]`指针的指向指向的是Person实例，通过Person实例链接到Person构造函数的原型的，这是因为这里包了一层

```js
Object.create(structFn.prototype)
```

相当于这里通过原型式继承，克隆了一份构造函数的原型对象，出发点是为了不在使用多余构造函数的情况下，实现数据共享, 原理其实如下

```js
function object(o){
    function Fn(){};
    Fn.prototype = o;
    return new Fn();
};
```

我觉得没必要，直接让，structFn.prototype也就是构造函数的原型直接等于新对象的`[[Prototype]]`特性就行

于是就改为

```js
obj.__proto__ = structFn.prototype;
```

之后打印出其他相关的

```js
console.log(per1.__proto__);
console.log(per2.__proto__);
console.log(Object.getPrototypeOf(per1) === Object.getPrototypeOf(per2));
console.log(Person.prototype.isPrototypeOf(per1));
console.log(Person.prototype.isPrototypeOf(per2));

console.log(per1 instanceof Person);
console.log(per2 instanceof Person);
```

结果如下:

![image-20210602104007880](image-20210602104007880.png)



OK成功手写了一个new，接下来就再试试能不能写call, aplly, bind这些用c/c ++写的底层代码