---
title: js的类型转换
date: 2021-05-28 10:55:50
tags:
- 类型转换
- ==
- ===
categories:
- Javascript
- 面试题

---



## 自我检测



```js
[] == ![] // -> true
```

D部分有答案

## 显式类型转换和隐式类型转换

强制转换经常发生在动态类型语言运行时。我们经常会写类型转换，如：



```js
var a=1 
var b=a+'' // 隐式 '1'
var c=String(a) // 显式 '1'
```

这里的隐式和显式是相对于开发者而言的。可以从代码中看出来类型转换的是显式，反则为隐式。

## A.抽象值操作

### 1.ToString

非字符串->字符串。

#### 基本类型



```rust
null -> 'null'
undefined -> 'undefined'
true -> 'true'
1 -> '1'
1 * 1 000 000 000 000 000 000 000 -> '1e+21'
```

#### 复杂类型

当对象有自己的`toString()`方法，字符串化时就会调用该方法，使用其返回值。



```js
const obj={
    a:'test',
    toString(){
        return 'yeah~~'
    }
}
//没有自定义的toString()方法应该返回[object Object]111，
console.log(obj+'111') // yeah~~111
```

#### JSON字符串化

对于大多数简单值来说，`JSON.stringify()`和`toString()`的效果基本相同，序列化的结果总是字符串。有一个比较特殊的情况：



```js
JSON.stringify('hello') // ""hello""  含有双引号的字符串
```

对于undefined、function、symbol来说会返回undefined，在数组中返回null、在对象中自动忽略。



```js
JSON.stringify(undefined) // undefined
JSON.stringify(function(){}) // undefined
JSON.stringify([function(){},2]) // "[null,2]"
JSON.stringify({a:function(){},b:2}) // "{"b":2}"
```



```js
const obj={
    a:'test',
    toJSON(){
        return 'yeah~~'
    }
}
console.log(JSON.stringify(obj))
```

答案：



```js
"yeah~~"
```

### 2.ToNumber

#### 基本类型



```rust
true -> 1
false -> 0
undefined -> NaN
null -> 0
```

处理字符串失败时返回NaN。

#### 复杂类型

对象（包括数组），先被转换为相应的基本类型值，如果返回的是非数字的基本类型值，则按照上面的规则强制转换为数字。

> 将值转换为相应的基本类型值，先检查该值是否有valueOf()方法，有并且返回基本类型值，则使用该值进行强制类型转换；没有就使用toString()的返回值进行强制转换。如果以上都不返回基类型值，产生TypeError错误。



```js
const obj={
    toString(){
        return '1'
    }
}
console.log({}) // NaN
console.log(Number(obj)) // 1
```

**注意**使用`Object.create(null)`创建的对象，无法进行强制转换！是因为其`[[Prototype]]`为空，没有`valueOf()`和`toString()`方法。

### 3.ToBoolean

##### 假值（falsy value）

js中的值可被分为两类：可被强制转换为false的值，和其他（可以被强制转换为true的值）。

以下这些为假值：



```js
undefined
null
fasle
+0 -0 NaN
""
```

虽然没有明确规定，我们可以默认除了这些值以外的所有值为真值。

## B.显式强制类型转换

### 字符串和数字之间的显式转换

一般通过`String()`和`Number()`这两个内建函数实现的。如：



```js
String(1) // "1"
Number('1.25') // 1.25
```

通过一元运算符以及`toString()`也被认为是显示强制类型转换。



```js
+'25' // 25
```

#### 日期显示转换为数字

一元运算符有一个常用的用途是，将Date对象强制转换为Unix时间戳，如：



```js
+new Date() // 1516625381333
```

我们也可以使用更显式的方法：



```js
new Date().getTime() // 1516625518125
```

最好还是使用`Date.now()`来获得当前的时间戳。

#### 位操作符~

~运算符，按位非，反转操作符的比特位。位操作符会强制操作数使用32位格式，通过ToInt32实现（ToInt32先执行ToNUmber强制转换，之后再执行ToInt32）。如果你不太明白他的运算机制，请记住一个公式：



```jsx
~4 -> -5
~x  =>  -(x+1)
```

~在日常开发中很少会用到，但在我们处理`indexOf()`时，可以将结果强制转换为真/假值。



```js
const str='hello'
str.indexOf('a') // -1
~str.indexOf('a') //0  -> 假值
```

~~x还可以用来截除小数部分，如：



```js
~~-22.8 -> -22
```

### 显式解析数字字符串

#### 解析和转换的区别

使用`parseInt()`将字符串解析为数字，它与`Number`的作用并不一样：

1. parseInt只能解析字符串，传入其他类型参数，如true、function(){}等，返回NaN。
2. parseInt可以解析含有非数字字符的字符串，如`parseInt('2px')`将会解析为2，Number则会返回NaN。

对于parseInt有一个经典的例子，



```jsx
parseInt(1/0,19) -> 18
```

这是因为1/0为Infinity，先被转化为字符串`'Infinity'`，第一个字符为i，在js中有效数字为09和0i，所以之后的n不会被解析，只解析到i为止，i为第18位，所以输出为18.

### 显式转换为布尔值

和上面的Number(),String()一样，Boolean()为显式的ToBoolean强制类型转换。但这个在开发中并不常用，通常使用`!!`来进行强制类型转换。

在`if()...`上下文中，如没有使用`Boolean()`或`!!`转成布尔值，则会进行隐式转换。但还是建议使用显式转换，让代码可读性更高。

## C.隐式强制类型转换

### 1.字符串和数字之间的隐式转换

#### +/-操作符

+如何判断是进行字符串拼接，还是数值加法呢？

> +的其中一个操作符为字符串（或是通过ToPrimitive抽象操作后转换为字符串的值）则进行字符串拼接，否则执行数字加法。

所以，通常上我们将空字符串与数值进行拼接，将其转换为字符串。



```js
const a='2'
const b=a-0
b // -> 2
```

通过`-`也可将a强制转换为数字，或者使用`a*1`或`a/1`，因为这两个运算符只适用于数字，所以比较少见。



```js
const a=[1]
const b=[3]
a-b // -> -2
```

### 2.隐式类型转换为布尔值

在以下情况中，非布尔值会被隐式转换为布尔值。

1. if()中的判断表达式
2. for(;;)中的条件判断表达式
3. while(...)和do..while(..)循环中的条件表达式
4. ? : 中的条件判断表达式
5. 逻辑运算符 || 和 && 左边的操作数。

但&&和||返回的值并不一定是布尔值，而是两个操作书中其中的一个。如：



```js
123||'hello' // 123
42&&'abc' // 'abc'
null || 'hello' // ->'hello'
null && 'hello' // ->null
```

### 3.Symbol的强制类型转换

ES6允许从符号到字符串得显示类型转换，但使用隐式转换会报错。



```js
const s1=Symbol('test')
String(s1) -> "Symbol(test)"
''+s1 -> Uncaught TypeError: Cannot convert a Symbol value to a string
```

同时，Symbol类型也不能被转换为数字（无论是显式还是隐式），但可以被转换为布尔值。

## D.宽松相等（ == ）和严格相等（ === ）

`==`允许在相等比较中进行强制类型转换，但`===`则不允许。

### 宽松相等的转换规则（==）

1. 对于基本类型：两个值的类型相同，则比较是否相等。
    除了NaN（NaN是js中唯一不等于自身的值）和+0/-0（+0 === -0）。类型不同的两个值参考第三条。
2. 对于对象（包括函数和数组）：他们指向同一引用时，即视为相等，不发生强制转换。
3. 在比较两个不同类型的值时，会发生隐式类型转换，将其转为相同的类型后再比较。

#### 字符串和数字之间的相等比较



```js
const a='12'
const b=12
a==b //true
a===b //false
```

规则为：`==`两边，哪边为数值类型，则另一边转为数值类型。

#### 其它类型和布尔类型之间的相等比较



```js
const a='12'
const b=true
a==b // false  a为真值，为什么返回false
```

因为在`==`两边，哪边为布尔类型，哪边转为数值类型！！
 同样，`a==false`也会返回`false`，因为这里的布尔值会被强制转换为数字0.

#### null和undefined之间的相等比较

只要记住：



```js
null == undefined //true
null === undefined //false
```

#### 对象和非对象之间的相等比较

对于布尔值和对象之间的比较，先把布尔值转换为数值类型。
 数值或字符串与对象之间的比较，对象先会调用`ToPromitive`抽象操作，之后再转为数值进行比较。



```js
const a=12
const b=[12]
a==b //true
b->'12'->12

const c=Object(null)
c==null //fasle 这里c被转换为空对象{}

const d=Object(undefined)
d==undefined // fasle 这里d被转换为空对象{}

const e=Object(NaN)
e==NaN // fasle 这里e被转换为Number(NaN) -> NaN 但NaN不等于自身，所以为false
```

#### 几个典型的坑



```js
// 小坑
"0" == false // -> true  这里false先被转为0，"0"也会转为0，所以为true
"0" == "" // -> false 两个都是字符串类型，直接比较
0 == '' // -> true 空字符串直接转为0
false == [] // -> true false先转为0；[]空数组转为''，之后ToNumber操作转为0

// 大坑
[] == ![] // -> true []  这里![]先被强制转换为false，变成[]与fasle的比较，之后fasle->0；[]->''->0，所以为true。
2=[2] // -> true [2]->'2'->2 所以为true
''==[null] // true [null]->''
0=='\n' // -> true '\n'->''->0
'true'==true // -> false true->0;'true'->NaN，所以为false
```

如果你还是一头雾水的话，请仔细阅读D部分这几种相互比较的规则和C部分的隐式类型转换。只要记住，遇到两个不同类型的值，转换优先顺序为布尔值>对象>字符串>数字；每一步的转换到相同类型的值即停止转换，进行比较判断。

## E.抽象关系比较

出现非字符串就先转为数字类型；如果两者都为字符串，按照字母顺序来比较，如：



```js
['22']<['023'] // -> false 这里并不转为数字，0在字母顺序上小于2，所以为false
22<['023'] // -> true
```

对于对象来说，也同样是转换成字符串，再进行比较，如:



```js
const a={a:1}
const b={a:2}
a>b // -> false
a<b // -> false
a==b // -> false
a<=b // -> true
a>=b // -> true
```

这个例子比较奇怪，虽然他们转成字符串都为`[Object Object]`，但两个对象的比较并不是转为字符串，而是看他们的引用是否指向同一值。这里`<=`被处理为`!>`，所以为`true`； `>=`同理。