---
title: 原型模式和基于原型继承的Javascript对象系统
date: 2020-03-16 22:28:09
tags:
- javascript
- js设计模式
- 原型链
categories:
- js
---

在**以类为中心的面向对象编程**语言中，类和对象的关系可以想象成铸模和铸件的关系，对象
总是<u>从类中创建</u>而来。而在**原型编程**的思想中，类并不是必需的，对象未必需要从类中创建而来，
一个对象是通过克隆另外一个对象所得到的。

## 1. 使用克隆的原型模式

从设计模式的角度讲，原型模式是用于创建对象的一种模式，如果我们想要创建一个对象，
一种方法是先指定它的类型，然后通过类来创建这个对象。原型模式选择了另外一种方式，我们
不再关心对象的具体类型，而是找到一个对象，然后通过克隆来创建一个一模一样的对象

既然原型模式是通过克隆来创建对象的，那么很自然地会想到，如果需要一个跟某个对象一
模一样的对象，就可以使用原型模式

原型模式的实现关键，是语言本身是否提供了 clone 方法。ECMAScript 5提供了 Object.create
方法

```javascript
var Plane = function () {
    this.blood = 100;
    this.attackLevel = 1;
    this.defenceLevel = 1;
}
var myPlane = new Plane();
myPlane.blood = 500;
myPlane.attackLevel = 10;
myPlane.defenceLevel = 7;
// 在不支持 Object.create 方法的浏览器中，则可以使用以下代码
Object.create = Object.create || function (obj) {
    var F = function () { };
    F.prototype = obj;
    return new F();
}
var clonePlane = Object.create(myPlane);
console.log(clonePlane);
```

![](1579487242257.png)

## 2. 原型编程范型的一些规则

1. 所有的数据都是对象
2. 要得到一个对象，不是通过实例化类，而是找到一个对象作为原型并克隆它。
3.  对象会记住它的原型。
4. 如果对象无法响应某个请求，它会把这个请求委托给它自己的原型。

## 3. JavaScript中的原型继承(构建对象系统)

同理，js也同样遵循以上的编程规则

### 1. 所有的数据都是对象

JavaScript在设计的时候，模仿 Java 引入了两套类型机制：基本类型和对象类型。基本类型包括 undefined 、 number 、 boolean 、 string 、 function 、 object 

除了 undefined 之外，一切都应是对象。为了实现这一目标，number 、 boolean 、 string 这几种基本类型数据也可以通过“包装类”的方式变成对象类型数据来处理

不能说在 JavaScript中所有的数据都是对象，但可以说绝大部分数据都是对象。那么相信在 JavaScript中也一定会有一个根对象存在，这些对象追根溯源都来源于这个根对象。

JavaScript 中的根对象是 `Object.prototype` 对象。 `Object.prototype` 对象是一个空的对象。我们在JavaScript 遇到的每个对象，实际上都是从 `Object.prototype` 对象克隆而来的，`Object.prototype` 对象就是它们的原型。

可以利用 ECMAScript 5提供的 Object.getPrototypeOf 来查看这两个对象的原型：

```javascript
var obj1 = new Object();
var obj2 = {};
console.log( Object.getPrototypeOf( obj1 ) === Object.prototype ); // 输出：true
console.log( Object.getPrototypeOf( obj2 ) === Object.prototype ); // 输出：true
```

### 2. 要得到一个对象，不是通过实例化类，而是找到一个对象作为原型并克隆它

在 JavaScript语言里，我们并不需要关心克隆的细节，因为这是引擎内部负责实现的。我
们所需要做的只是显式地调用 `var obj1 = new Object()` 或者 `var obj2 = {}` 。此时，引擎内部会从`Object.prototype` 上面克隆一个对象出来，我们最终得到的就是这个对象.

用 new 运算符从构造器中得到一个对象

```javascript
function Person( name ){
	this.name = name;
};
Person.prototype.getName = function(){
	return this.name;
};
var a = new Person( 'sven' )
console.log( a.name ); // 输出：sven
console.log( a.getName() ); // 输出：sven
console.log( Object.getPrototypeOf( a ) === Person.prototype ); // 输出：true
```

这里 Person 并不是类，而是函数构造器，JavaScript 的函数既可以作为普通函数被调用，也可以作为构造器被调用,当使用 new 运算符来调用函数时，此时的函数就是一个构造器。 用new 运算符来创建对象的过程，实际上也只是先克隆 Object.prototype 对象，再进行一些其他额外操作的过程。

**可以模拟new的过程：**

```javascript
// 模拟new的实现方式
// 先来一个Person构造器

function Person(name) {
    this.name = name;
}

Person.prototype.getName = function () {
    return this.name;
}

var objectFactory = function () {
    var obj = new Object(), //从Object.prototype上克隆一个空的对象{}
        Constructor = [].shift.call(arguments); // 取得外部传入的构造器，此例是 Person
    obj.__proto__ = Constructor.prototype; // 指向正确的原型
    var ret = Constructor.apply(obj, arguments); // 借用外部传入的构造器给 obj 设置属性
    return typeof ret === 'object' ? ret : obj; // 确保构造器总是会返回一个对象
}

var a = objectFactory(Person, 'weng');
console.log(a.getName());
```

### 3. 对象会记住它的原型

对象的原型”，就 JavaScript 的真正实现来说，其实并不能说对象有原型，而只能说**对象的构造器有原型**。对于“对象把请求委托给它自己的原型”这句话，更好的说法是**对象把请求委托给它的构造器的原型**

JavaScript 给对象提供了一个名为 `__proto__` 的隐藏属性，某个对象的 `__proto__` 属性默认会指向它的构造器的原型对象，即 `{Constructor}.prototype `。在一些浏览器中， `__proto__` 被公开出来

```javascript
var a = new Object();
console.log ( a.__proto__=== Object.prototype ); // 输出：true 
```

`__proto__` 就是对象跟“对象构造器的原型”联系起来的纽带。正因为对象要通过`_proto__` 属性来记住它的构造器的原型，所以我们的 objectFactory 函数来模拟用 new创建对象时， 需要手动给 obj 对象设置正确的 `__proto__` 指向

`obj.__proto__ = Constructor.prototype;`

让 obj.__proto__ 指向 Person.prototype ，而不是原来的 Object.prototype

### 4. 如果对象无法响应某个请求，它会把这个请求委托给它的构造器的原型

在 JavaScript 中，每个对象都是从 Object.prototype 对象克隆而来的，如果是这样的话，
我们只能得到单一的继承关系，即每个对象都继承自 Object.prototype 对象，这样的对象系统显
然是非常受限的。

实际上，虽然 JavaScript 的对象最初都是由 Object.prototype 对象克隆而来的，但对象构造
器的原型并不仅限于 Object.prototype 上，而是可以动态指向其他对象。这样一来，当对象 a 需
要借用对象 b 的能力时，可以有选择性地把对象 a 的构造器的原型指向对象 b ，从而达到继承的
效果

#### 常用原型继承代码解析

```javascript
var obj = { name: 'sven' };
var A = function(){};
A.prototype = obj;
var a = new A();
console.log( a.name ); // 输出：sven
```

1. 首先，尝试遍历对象 a 中的所有属性，但没有找到 name 这个属性
2. 查找 name 属性的这个请求被委托给对象 a 的构造器的原型，它被 `a. __proto__` 记录着并且
   指向 `.prototype` ，而 `A.prototype` 被设置为对象 obj
3. 在对象 obj 中找到了 name 属性，并返回它的值

当我们期望得到一个“类”继承自另外一个“类”的效果时，往往会用下面的代码来模拟实现

```javascript
var A = function(){};
A.prototype = { name: 'sven' };
var B = function(){};
B.prototype = new A();
var b = new B();
console.log( b.name ); // 输出：sven
```

1. 首先，尝试遍历对象 b 中的所有属性，但没有找到 name 这个属性
2. 查找 name 属性的请求被委托给对象 b 的构造器的原型，它被 `b. __proto__` 记录着并且指向
   `B.prototype` ，而 `B.prototype `被设置为一个通过 `new A() `创建出来的对象
3. 在该对象中依然没有找到 name 属性，于是请求被继续委托给这个对象构造器的原型
   `A.prototype`
4. 在 A.prototype 中找到了 name 属性，并返回它的值
