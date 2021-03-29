---
title: 'var, let, const声明变量'
date: 2021-03-14 15:39:55
tags:
- js
- 变量
categories:
- js

---

> ECMAscript中变量是松散类型的，意思就是可以用于保存任何类型的数据
>
> 有3个关键字可以声明变量 var, const, let
>
> var 在所有版本ECMAscript中都能用，let const只能在ES6中使用

## var 关键字

```js
var a = 11212	
```

### 1. var 声明作用域

使用var操作符号定义的变量会成为**包含它的函数**的局部变量，会被拿到函数或全局作用域得顶部

```js
function hello(){
	var a = 'hi'; // 局部变量
}
hello();
console.log(a); // 出错
```

这里声明了a变量，函数使用完退出之后就销毁了这个a变量

但是有一种情况，直接在函数中声明全局变量

```js
function hello(){
    a='hi';
}
hello();
console.log(a); // hi
```

调用hello()函数之后全局注入了一个a的变量，这个变量

> 虽然可以通过省略var操作符定义全局变量，但是不推荐。局部作用域中定义全局变量很难维护。

### 2. var声明提式（变量提升hoist）

如下

```js
function foo(){
    console.log(a);
    var a = '1212';
}
foo(); // undifined
```

a变量在定义之前就已经被访问，但是关键字会自动提升到函数作用域的顶部

等价于

```js
function foo(){
    var a;
    console.log(a);
    a = '1212';
}
foo();
```

### 3. 全局变量声明

在全局中使用var来声明变量，这个变量会成为window对象的属性

```js
var name = 'weng';
console.log(window.name) // weng
```



## let声明

### 1. let的块作用域

> let和var的作用差不多，但是有很大区别。最明显的是Let声明的范围是块作用域， 而var声明的范围是函数作用域

var

```js
if(true){
    var name = 'a';
    console.log(name); // a
}
console.log(name); // a
```

let 

```js
if(true){
    let name = 'a';
    console.log(name); // a
}
console.log(name); // ReferenceError:name 没有定义
```

这里用let声明的变量之所以不能在if块外部被引用，是因为它的作用域仅限于该块的内部

块作用域是函数作用域的子集， 函数作用域 > 块作用域

> 因此适用于var的作用域也适用于let作用域



1. 当然let也不允许同一个块作用域中出现冗余的声明，这样会报错

```js
var name;
var name;

let age;
let age; // SntaxError;标识符age已经声明过了
```



2. js引擎会记录用于变量声明的标识符以及其所在的块作用域，嵌套使用相同的标识符不会报错，因为在同一块中没有重复声明

   ```js
   let age =30;
   console.log(age);
   function hello(){
   	let age = 20;
       console.log(age); // 20
   }
   ```

   

### 2. 暂时性死区（let不存在变量提升）

let 与var的另外一个重要区别就是let声明的变量不会在所对应的块作用域中被提升

```js
console.log(name); // ReferenceError; age未被定义
let age = 2;
```

let和var同理，在访问name变量的时候js会去找块后面的let声明，只是var声明的变量可以提前访问，let不能够提前访问；

在let声明之前执行瞬间被称作“暂时性死区”



### 3.全局变量声明

```js
let age = 26;
console.log(window.age) // undifined
```

let全局声明的变量并不会成为window对象的属性这点与var有区别

不过let声明在全局作用域中发生，相对应的变量会在页面的声明周期中续存

### 4.for循环中的let声明

在let出现之前，for循环体定义的迭代变量会渗透到循环体的外部

```js
for(var i =0;i<9;i++){
    // ....
}
console.log(i); // 9
```

在使用let之后这个问题就消失了；

```js
for(let i = 0;i<9;i++){
    // ....
}
console.log(i); // ReferenceError;i 没有定义
```



在使用var的时候，最常见的问题就是对迭代变量的奇特声明和修改

```js
for(var i = 0;i<5;i++){
    setTimeout(()=>console.log(i),0);
}
// 你以为的输出0，1，2，3，4，5
//实际 5，5，5，5，5
```

之所以这样是因为在退出循环的时候，迭代变量保存的是导致循环退出的值：5.

之后执行异步逻辑的时候，所有的i都是同一个变量，因此都是同一个最终值

而使用ley声明迭代变量的时候，js引擎会在后台为每个迭代循环声明一个新的迭代变量，也就是每个内部的异步函数引用的都是不同的变量实例，所以console.log()输出的是我们期望的值



## const声明

> const和let相同，唯一区别就是它声明的变量时必须初始话一个值，并且后续尝试修改声明的变量会导致报错



*注意

const声明得限制只适用于它指向的变量的引用，换句话说，如果const变量的引用指向一个对象，那么修改这个对象内部的属性，并不违反const的限制

一般const用在for..of for.. in 语句中