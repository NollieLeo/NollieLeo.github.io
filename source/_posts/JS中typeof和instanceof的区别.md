---
title: JS中typeof和instanceof的区别
date: 2020-03-31 09:29:49
tags: 
- ES6
- 基本数据类型和引用类型
categories:
- js
---

 `undefined`, `number`, `string`, `boolean`属于简单的**值类型**，不是对象。剩下的几种情况——函数、数组、对象、`null`、`new Number(10)`都是对象。他们都是引用类型。 

[基本数据类型和引用类型](http://pxc3lp.coding-pages.com/2020/03/16/%E5%9F%BA%E6%9C%AC%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%E5%92%8C%E5%BC%95%E7%94%A8%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B/)

## typeof

```javascript
console.log(typeof (x)); // 'undefined'
console.log(typeof (10)); // 'number'
console.log(typeof ('abc')); // 'string'
console.log(typeof (true)); // 'boolean'
console.log(typeof (function () { })); // 'function'
console.log(typeof ([1, 'dsa', true])); // 'object'
console.log(typeof ({ a: 123, b: true })); // 'object'
console.log(typeof (null)); // 'object'
console.log(typeof (new Number(0))); // 'object'
console.log(typeof(new Date())); // 'object'
console.log(typeof(/a/g)); // 'object'
```

**我们可以用typeof判断一个变量是否存在**

```javascript
if(typeof a !=='undefined'){
	alert('OK')
}
```

而不是`if(a)`这样的用法，因为如果这样a为定义就会报错。

简单的**值类型**直接用`typeof`就能够判断出来

但是引用类型使用 `typeof` 判断就不太准确。如上代码所示，例如数组，正则表达式，日期，对象等`typeof`返回值都是为 `object` 函数的返回值则是`function`

**在 JavaScript 中，判断一个变量的类型尝尝会用 `typeof` 运算符，在使用 `typeof` 运算符时采用引用类型存储值会出现一个问题，无论引用的是什么类型的对象，它都返回 “object”。这就需要用到`instanceof`来检测某个对象是不是另一个对象的实例。**

## instanceof

```javascript
语法：object instanceof constructor
```

参数：`object`（要检测的对象.）`constructor`（某个构造函数）

描述：`instanceof`运算符用来检测`constructor.prototype`是否存在于参数object的原型链上

**对象与函数的关系**： 函数是一种对象，但函数不像数组正则日期这些对象。其他的对象（函数除外）都是对象的一个子集，但是函数却可以创造出对象来

```javascript
function People(){
	this.name = 'hello world';
	this.birth - 1998;
}
var people = new People();
```

people这个对象是由People的构造函数创建出来的，

`instanceof`的使用规则：`A instanceof B`

 A沿着**proto**这条线来找，同时B沿着prototype这条线来找，如果两条线能找到同一个引用，即同一个对象，那么就返回true。如果找到终点还未重合，则返回false。 

![](20180203152226402.png)

例如：

### 可以用于判断一个变量是否是某个对象的实例

```javascript
console.log(people instanceof People); // true
```

```javascript
console.log(people instanceof Object); // true
```

因为people是由 People构造函数搞出来的，而People又是object的子类



### 可以在继承关系中用来判断一个实例是否属于它的父类型

例如：

```javascript
function People() {
  this.name = 'hello world';
  this.birth = 1998;
}
function Male(){}
Male.prototype = new People();
const man = new Male();
console.log(man instanceof Male); // true 
console.log(man instanceof People); // true
```

又如：

```javascript
// 定义构造函数
function C(){} 
function D(){} 

var o = new C();

// true，因为 Object.getPrototypeOf(o) === C.prototype
o instanceof C; 

// false，因为 D.prototype不在o的原型链上
o instanceof D; 

o instanceof Object; // true,因为Object.prototype.isPrototypeOf(o)返回true
C.prototype instanceof Object // true,同上

C.prototype = {};
var o2 = new C();

o2 instanceof C; // true

o instanceof C; // false,C.prototype指向了一个空对象,这个空对象不在o的原型链上.

D.prototype = new C(); // 继承
var o3 = new D();
o3 instanceof D; // true
o3 instanceof C; // true
```

需要注意的是，如果表达式 `obj instanceof Foo` 返回true，则并不意味着该表达式会永远返回true，因为`Foo.prototype`属性的值有可能会改变，改变之后的值很有可能不存在于`obj`的原型链上，这时原表达式的值就会成为`false`。另外一种情况下，原表达式的值也会改变，就是改变对象`obj`的原型链的情况，虽然在目前的ES规范中，我们只能读取对象的原型而不能改变它，但借助于非标准的`__proto__`魔法属性，是可以实现的。比如执行`obj.__proto__ = {}`之后，`obj instanceof Foo`就会返回`false`了。

```javascript
function People(){
  this.name = 'hello'
}
const a = new People();
console.log(a instanceof People); // true
a.__proto__ = {};
console.log(a instanceof People); // false
```

