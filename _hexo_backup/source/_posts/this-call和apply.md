---
title: 'this,call和apply'
date: 2020-03-16 17:16:30
tags: 
- Javascript
- call
- apply
categories:
- Javascript
---

# this, call 和apply

## 1. this

>JavaScript的 this 总是指向一个对象，而具体指向哪个对象是**在运行时基于函数的执行环境动态绑定**的，而非函数被声明时的环境

### 1.1 this指向

- 作为对象方法调用
- 作为普通函数调用
- 构造器调用
- `Function.prototype.apply`或``Function.prototype.call`

#### 1.1.1 作为对象方法调用

```javascript
var obj = {
    a:1,
    getA:function(){
        alert(this === obj);
        alert(this.a);
    }
}
obj.getA();
```

#### 1.1.2 作为普通函数调用

当函数<u>不作为对象的属性</u>被调用时，也就是我们常说的普通函数方式，此时的 **this 总是指向全局**对象。在浏览器的 JavaScript里，这个全局对象是 window 对象

```javascript
window.name = 'globalName';
var myObject = {
    name: 'sven',
    getName: function () {
        return this.name;
    }
};
var getName = myObject.getName; //作为普通函数，这时候this指向全局，因为它不是以对象的属性调用的，可以看1.2
console.log(getName()); // globalName
```

#### 1.1.3 构造器调用

> JavaScript 中没有类，但是可以从构造器中创建对象，同时也提供了 new 运算符，使得构造器看起来更像一个类
>
> 除了宿主提供的一些内置函数，大部分 JavaScript函数都可以当作构造器使用。构造器的外表跟普通函数一模一样，它们的区别在于被调用的方式。当用 new 运算符调用函数时，该函数总会返回一个对象，通常情况下，构造器里的 this 就指向返回的这个对象

```javascript
var MyClass = function(){
this.name = 'sven';
};
var obj = new MyClass();
alert ( obj.name ); // 输出：sven
```

但用 new 调用构造器时，还要注意一个问题，如果构造器显式地返回了一个 object 类型的对象，那么此次运算结果最终会返回这个对象，而不是我们之前期待的 this

```javascript
var MyClass = function(){
this.name = 'sven';
return { // 显式地返回一个对象
name: 'anne'
}
};
var obj = new MyClass();
alert ( obj.name ); // 输出：anne
```

如果构造器不显式地返回任何数据，或者是返回一个非对象类型的数据，就不会造成上述
问题：

```javas
var MyClass = function(){
this.name = 'sven'
return 'anne'; // 返回 string 类型
};
var obj = new MyClass();
alert ( obj.name ); // 输出：sven
```

#### 1.1.4  Function.prototype.call 或 Function.prototype.apply 调用

跟普通的函数调用相比，用 Function.prototype.call 或 Function.prototype.apply 可以动态地
改变传入函数的 this ：

```javascript
var obj1 = {
	name: 'sven',
	getName: function(){
		return this.name;
	}
};
var obj2 = {
	name: 'anne'
};
console.log( obj1.getName() ); // 输出: sven
console.log( obj1.getName.call( obj2 ) ); // 输出：anne
```

### 1.2 丢失的this

```javascript
var obj = {
myName: 'sven',
	getName: function(){
	return this.myName;
	}
};
console.log( obj.getName() ); // 输出：'sven'
var getName2 = obj.getName;
console.log( getName2() ); // 输出：undefined
```

当调用 obj.getName 时， getName 方法是作为 obj 对象的属性被调用的，当用**另外一个变量** getName2 来引用 obj.getName ，并且调用getName2 时，此时是以普通函数的形式来调用的， this 是指向全局 window 的

再来个栗子

```javascript
document.getElementById = (function( func ){
	return function(){
		return func.apply( document, arguments );
}
})( document.getElementById );
var getId = document.getElementById;
var div = getId( 'div1' );
alert (div.id); // 输出： div1
```

利用 apply 把 document 当作 this 传入 getId 函数，帮助“修正” this

否则如果想要简化document.getElementById单纯的是不可取的

```javascript
 var getId = document.getElementById;
        console.log(getId('hello'));
```

## 2. call 和apply

### 2.1 区别

`Function.prototype.call `和 `Function.prototype.apply `都是非常常用的方法。它们的作用一模一样，区别仅在于传入参数形式的不同

**apply** 接受两个参数，**第一个参数**指定了函数体内 this 对象的指向，**第二个参数**为一个带下标的集合，这个集合可以为<u>数组</u>，也可以为<u>类数组</u>,apply 方法把这个集合中的元素作为参数传递给被调用的函数

**call** 传入的参数数量不固定，跟 apply 相同的是，第一个参数也是代表函数体内的 this 指向，从**第二个参数**开始往后，每个参数被依次传入函数

```javascript
var func = function (a, b, c) {
    alert([a, b, c]); // 输出 [ 1, 2, 3 ]
};
func.call(null, 1, 2, 3);

func.apply(null, [1, 2, 3]);
```

当调用一个函数时，JavaScript 的解释器并不会计较形参和实参在数量、类型以及顺序上的区别，JavaScript的参数在内部就是用一个数组来表示的。从这个意义上说， apply 比 call 的使用率更高，我们不必关心具体有多少参数被传入函数，只要用 apply 一股脑地推过去就可以了

<u>当使用 call 或者 apply 的时候，如果我们传入的第一个参数为 null ，函数体内的 this 会指向默认的宿主对象，在浏览器中则是 window</u>

有时候我们使用 call 或者 apply 的目的不在于指定 this 指向，而是另有用途，比如借用其
他对象的方法。那么我们可以传入 null 来代替某个具体的对象：

```javascript
Math.max.apply( null, [ 1, 2, 5, 3, 4 ] ) // 输出：5
```

### 2.2 call 和 apply 的用途

#### 2.2.1 改变 this 指向

```javascript
window.name = 'motherfucker';
obj1 = {
    name: 'helloobj1',
}
obj2 = {
    name: 'hellowobj2',
}
var getName = function () {
    console.log(this.name);
}
getName();
getName.apply(obj1);
getName.apply(obj2);
```

![](1579747558506.png)

实际开发过程中会遇到this指向被不经意改变

例如：

```javascript
document.getElementById( 'div1' ).onclick = function(){
	alert( this.id ); // 输出：div1
};
```

假如该事件函数中有一个内部函数 func ，在事件内部调用 func 函数时， func 函数体内的 this就指向了 window ，而不是我们预期的 div 

```javascript
document.getElementById( 'div1' ).onclick = function(){
	alert( this.id ); // 输出：div1
	var func = function(){
		alert ( this.id ); // 输出：undefined
	}
	func();
};
```

解决方法有两种，一种是之前提到的

```javascript
document.getElementById('hello').onclick = function () {
    var that = this;
    console.log(that.id); // 输出：hello
    var func = function () {
        console.log(that.id); // 输出：undefined
    }
    func();
};
```

第二种就是call和apply

```javascript
document.getElementById( 'div1' ).onclick = function(){
	var func = function(){
		alert ( this.id ); // 输出：div1
	}
	func.call( this );
};
```

