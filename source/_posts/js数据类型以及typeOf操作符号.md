---
title: js数据类型以及typeOf操作符号
date: 2021-03-14 16:23:49
tags:
- js
- typeOf
categories:
- js

---

> ES6有6中 **简单数据类型**（**原始类型**）和一种复杂数据类型
>
> 简单：Undifined, Null, Boolean, Number, String, Symbol
>
> 复杂：object

所有的值都可以用以上7种来表示

## typeof操作符

ES的类型系统是松散的，typeof可以确定任意变量的数据类型。

typeof对一个值使用会返回的字符串之一

- "undefined" 表示值未定义
- "boolean" 布尔值
- "string" 字符串
- "number" 数值
- "object" 表示为对象（而不是函数）或者null
- "function"表示函数
- "symbol"表示符号

> 函数在es中被认为是对象，但是不代表一种数据类型
>
> 因此typeof可以很好的区别它和其他对象的区别

## 类型

### undefined

只有一个值，就是特殊值`undefined`

当用let或者var 声明了变量但是没有初始化（给一个初始值）的时候，这个变量就相当于赋予了undefined值

```js
let msg;
console.log(msg);// undefined
```

我们不需要显式的去给值赋值一个undefined，因为系统自动都会给未初始化的值赋值undefined

*注意:

使用typeof，未声明的变量和未初始化的变量返回都是`undefined`

```
typeof a; // undefined
let b;
typeof b; // undefined
```

### NULL

null类型也是同样只有一个值，特殊值Null；

null逻辑上讲，表示的是一个**空对象指针**，毕竟typeof null的时候是‘object';

因此在定义将来要保存对象值得变量得时候，建议使用null初始化

undefined值是由null值派生而来的，因此ECMA-262将他们定义为表面上相等。

```js
console.log(null == undefined)
```

*==操作符会对数据两头得数据类型进行转换，这个单独写一篇讲



### Boolean

boolean就两值，`true` or `false`；

虽然只有两个值，但是可以通过特定得**Boolean()**转型函数将其他类型得值转换为布尔值

#### 1.Boolean()转型

不同类型值转换为布尔值得转换规则如下

| 数据类型  | 转为true              | 转为false |
| --------- | --------------------- | --------- |
| Boolean   | true                  | false     |
| String    | 非空字符串            | ""        |
| Undefined | N/A(不存在)           | undefined |
| Number    | 非0得数值（Infinity） | 0, NaN    |
| Object    | 任何对象              | null      |

*像一些if等流控制语句会自动得将其他类型值转换为boolean类型值

```js
const a = '2121';
if(a){
    console.log(hello);
}
// hello;
```



### *Number

最有意思得数据类型了

Number类型使用得是**IEEE 754**格式表示整数和浮点值

1. 十进制
2. 八进制(0开头，数字0~7)
3. 十六进制（0x开头，数字0~9，字母A~F）

```js
let a1 = 55; // 55
let a2 = 070; // 八进制的 56
let a3 = 098; // 无效八进制,自动转为十进制98
```

#### 1. 浮点数

表示：1.1， 1.2 ， 3.125e7， 3.125e-8

*浮点数精确度问题

```js
if(0.1 + 0.2==0.3){
    console.log('hello') 
}
// 这里的0.1 + 0.2 是不等于0.3的
```

#### 2. 值得范围

内存限制，ES不能表示这世界上所有得

最小值存在：`Number.MIN_VALUE`中

最大值存在：`Number.MAX_VALUE`中

如果两个值得运算超过这两个极限值，则会是Infinity表示



#### 3. NaN

特殊得数值：NaN，意思就是不是一个数值；

用于本来是要返回数值得操作失败了（不抛错）

##### 1）涉及任何NaN得操作都会返回NaN

##### 2）console(NaN == NaN)

为false

##### 3）isNaN()函数

判断传入得值是否 ”不是数值“

该函数会将传入得值尝试去转换为数值，任何不能转换为数值得值都会导致这个函数返回true

``` JS
isNaN(NaN) // true
isNaN(10) // false
isNaN('10') // false
isNaN('blue') //true
isNaN(true) // false
```

> isNaN可以用于测试对象，首先会去调用对象得valueOf()方法，确定返回得值是否可以转换为数值，如果不行再调用toString()方法并测试返回值；

#### 4. 数值转换

有3个函数可以将非数值型数据转为数值

Number(), parseInt(), parseFloat()

##### 1) Number()

转型函数可以用于任意类型得数据

转型规则如下

1. 布尔值，true为1，false为0

2. 数值，直接返回数值

3. null，返回0

4. **undefined**，返回**NaN**

5. 字符串

   - 包含数值字符串，包括前面带着+，- 号得情况，则转换为一个十进制数值

     ```js
     Number("1") // 1
     Number("123abc") // 123
     Number("0111") // 111
     ```
	  
	- 字符串包含浮点值字符串
	
	  ```js
	  Number("1.1") // 1.1
	  ```
	
	  
	
	- 字符串包含有效得十六进制格式，则转换为该十六进制对应得十进制数
	
	  ```js
	  Number("0xA") // 10
	  ```
	
	  
	
	- 空字符串，则返回0
	
	- 除了以上情况外，返回NaN
	

6. 对象

   调用对象得valueOf()方法，并且按照上述规则转换返回得值。如果转换结果是NaN，则再调用对象得toString()方法，再按规则去转换

   ```
   Number("hello world") // NaN
   ```

   > 一元加操作符也遵循Number()转换规则

##### 2) ParseInt()

此函数更加专注于字符串是否包含数值模式

如果第一个字符不是数值字符， + -符号，则立即返回NaN

空字符串也立即返回NaN

```js
parseInt("123") //123
parseInt("123abc") // 123
parseInt("") // NaN
parseInt("0xf") // 15
parseInt("07") // 7
```

也接受第二个参数

```
parseInt("0xAF",16) // 175
parseInt("AF",16) // 175
parseInt("AF") //NaN
```

##### 3) ParseFloat()

和parseInt相似

### String

字符串数据类型表示零或者多个16位得Unicode字符序列

##### 1. 字符字面量

用于表示非打印字符或者其他用途字符

```js
\t 
\n
\b
\r
\f
\\
\'
\"
\`
\xnn
\unnn
```

> 如果字符串包含双字节字符，length就不好确定了

##### 2. 字符串特点

es中得字符串是不可变的，一旦创建，值就不能再变化，要修改其中一个字符串值，必须先销毁原来得字符串再将包含新值的另一个字符串保存到该变量

##### 3. 转换为字符串（toString & String()）

适用于 数值，字符串，布尔值，对象（字符串的toString只是简单的返回自身的一个副本），**null和undefined没有这个方法**

###### 1）toString()

toString再对数值类型进行转换的时候可以传入参数，其他的类型不允许

```js
let num = 10;
num.toString(); // "10"
num.toString(2); // "1010"
num.toString(8); // "12"
num.toString(16); // "a"
```

###### 2)   String()

如果不确定一个值是否为null或者undefined可以使用String()转型函数

转换规则↓

- 如果值有toString()的方法，则调用该方法返回结果
- 如果只是null返回"null"，undefined返回"undefined"

> 用加号给一值加上一个空字符串""也可以将其转换为字符串

##### 4. 模板字面量

```js
const name = 'lihua';
console.log(`hello ${name}`); // hello lihua
```

- 模板字面量保留换行符号,  空格

```js
const one = 'first line \nsecond line'; 
// first line
// second line
const two = `first line
second line`;
// first line
// second line
```

