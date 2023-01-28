---
title: 手写bind
date: 2021-06-03 16:58:33
tags:
- bind
- Javascript
- 面试题
- 原型
- 原型链
categories:
- Javascript


---

# 手写bind

## 原理

> bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。(来自于 MDN )

由此我们可以首先得出 bind 函数的两个特点：

1. 返回一个函数
2. 可以传入参数



## 实现

首先先在Function的原型上挂载一个自定义bind函数

```js
Function.prototype._bind = function(){}
```

### 1. 模拟实现返回一个函数

正常的使用bind的时候是返回一个函数，这里返回的函数的引用(this)依旧指向的是调用bind的函数，而不是新得返回函数, 而且 考虑到绑定函数可能是有返回值 ，所以这块还是要处理下

```js
const obj ={
    name: 'weng',
};

function sayName(){
    return this.name;
}

const a = sayName._bind(obj);
console.log(a()); //weng
```

所以这块的this指向需要做处理。

```js
Function.prototype._bind = function(context){
    const that = this;
    return function(){
      return that.call(context);
    }
}
```

这里用that存储this，之后返回一个闭包函数

### 2. 传参数

在执行bind的时候，bind可以传参数，而且bind返回之后的函数也可以传参数

```js
const obj ={
    name: 'weng',
};

function sayName(age, address){
    return `${this.name}: ${age} : ${address}`;
}

const a = sayName.bind(obj, 23);

console.log(a('fujian')); // weng : 23 : fujian
```

这里就相当于内部实现一个函数柯里化用来存储每次传进来的数据，但是没有柯里化那么牛逼，具体可以看实现函数柯里化那那篇文章

具体实现如下

```js
Function.prototype._bind = function(context){
    const that = this;
    const outerArgs = Array.prototype.slice.call(arguments, 1); // 存下第一次传的参数， 截掉第一个
    return function(){
      const innerArgs = Array.prototype.slice.call(arguments);
      return that.call(context, ...outerArgs.concat(innerArgs)); // 把外层参数拼接到内层的参数类数组里头
    }
}
```

### 3. 构造函数的模拟实现

> 一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。

也就是说当 bind 返回的函数作为构造函数的时候，bind 时指定的 this 值会失效，但传入的参数依然生效。举个例子：

```js
const obj = {
    preName: "weng",
};

function Bar(name, age) {
    this.name = name;
    this.age = age;
}

Bar.prototype.sayName = function(){
    console.log(this.name)
}

const MyBar = Bar.bind(obj, "kaimin");

const o = new MyBar(12);

console.log(o);
```

结果如下

![image-20210604110748385](image-20210604110748385.png)

可以得知此时Bar函数的this指向的是o对象，就是相当于以new的形式调用了构造函数，这块的原理可以去 手写new那篇文章看看

```js
Function.prototype._bind = function (context) {
    const that = this;
    const outerArgs = Array.prototype.slice.call(arguments, 1);

    const returnFn = function () {
      const innerArgs = Array.prototype.slice.call(arguments);
      return that.call(
        this instanceof returnFn ? this : context,
        ...outerArgs.concat(innerArgs)
      );
    };
    returnFn.prototype = this.prototype;
    return returnFn;
};
```

以這行代碼来说

```js
  return that.call(
    this instanceof returnFn ? this : context,
    ...outerArgs.concat(innerArgs)
  );
```
当作为构造函数时，this 指向实例，此时`this instanceof returnFn`结果为 true，将绑定函数的 this 指向该实例，可以让实例获得来自绑定函数的值
以上面的是 demo 为例，如果改成 `this instanceof returnFn? null : context`，实例只是一个空对象，将 null 改成 this 
当作为普通函数时，this 指向 window，此时结果为 false，将绑定函数的 this 指向 context


### 4. 构造函数效果的优化实现

> 但是在这个写法中，我们直接将 fBound.prototype = this.prototype，我们直接修改 fBound.prototype 的时候，也会直接修改绑定函数的 prototype。这个时候，我们可以通过一个空函数来进行中转：

```js
Function.prototype._bind = function (context) {
    const that = this;
    const outerArgs = Array.prototype.slice.call(arguments, 1);

    const _Transit = function(){};

    const returnFn = function () {
      const innerArgs = Array.prototype.slice.call(arguments);
      return that.call(
        this instanceof returnFn ? this : context,
        ...outerArgs.concat(innerArgs)
      );
    };
    _Transit.prototype = this.prototype;
    returnFn.prototype = new _Transit();
    return returnFn;
};
```

这里相当做了个私有变量（匿名构造函数类似的），外部是不能访问到的，所以如果后续做returnFn的原型修改，也只是改在了这个私有构造函数new出来的实例上的，这个实例的`[[Prototype]]`指向的是真正的this原型。

### 5. 最后做一个日常判定this是否为函数

```js
if (typeof this !== "function") {
  throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
}
```

### 6.最终代码

```js
Function.prototype._bind = function (context) {
    if(typeof this !== 'function'){
      // MDN上的
      throw new Error('Function.prototype.bind - what is trying to be bound is not callable"')
    }
    const that = this;
    const outerArgs = Array.prototype.slice.call(arguments, 1);

    const _Transit = function(){};

    const returnFn = function () {
      const innerArgs = Array.prototype.slice.call(arguments);
      return that.call(
        this instanceof returnFn ? this : context,
        ...outerArgs.concat(innerArgs)
      );
    };
    _Transit.prototype = this.prototype;
    returnFn.prototype = new _Transit();
    return returnFn;
};
```



## 测试

```js
let o = {
    address: 'fujian'
}

function Person(name, age){
    this.name = name;
    this.age = age;
}

const NewPerson = Person._bind(o, 'weng');

const per1 = new NewPerson(23);

console.log(per1);
```

最终打印的是这样的

![image-20210604150133583](image-20210604150133583.png)

正常打印出来是这样的，差了一个标识的问题， 这个无所谓了

![image-20210604150802371](image-20210604150802371.png)

```js
let o = {
    address: 'fujian'
}

function sayHi(name, age){
    console.log(this.name = name, this.age = age, this.address);
}

const hi = sayHi.bind(o, 'weng');

hi(23); // weng 23 fujian
```

