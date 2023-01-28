---
title: js数据类型以及typeOf操作符号
date: 2021-03-14 16:23:49
tags:
- Javascript
- typeOf
categories:
- Javascript

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

- 模板字面量不是字符串而是一种特殊的js句法表达式，只不过求值之后是字符串

  所有的插入值最后都会使用`toString()`强制转型维字符串，适用与任何的js表达式

  ```js
  let foo =  {
      toString: ()=> 'world'
  };
  console.log(`hello ${foo}`);
  ```

- 模板字面量标签函数

  ```js
  let a = 6;
  let b = 5;
  function simpleTag(strings, aValExpression, bValExpression, sum){
      console.log(strings);
      console.log(aValExpression);
  	console.log(bValExpression);
      console.log(sum);
  	return 'motherfucker';
  }
  
  let resUntagged = `${a} + ${b} = ${a + b}`;
  let resTagged = simpleTag`${a} + ${b} = ${a + b}`;
  // ["", "+", "=", ""]
  // 6 
  // 5
  // 11
  
  console.log(resUntagged); // 6 + 9 = 15
  console.log(resTagged); // motherfucker
  ```

  表达式的参数一般可变，所以用...rest 传入

  ```js
  let a = 6;
  let b = 5;
  function simpleTag(strings, ...rest){
      console.log(strings);
      for(const express of rest){
          console.log(express);
      }
  	return 'motherfucker';
  }
  
  let resTagged = simpleTag`${a} + ${b} = ${a + b}`;
  // ["", "+", "=", ""]
  // 6 
  // 5
  // 11
  
  console.log(resTagged); // motherfucker
  ```

  如果需要通过一个标签函数得到原始字符串的话

  ```js
  let a = 6;
  let b = 9;
  
  function zipTag(strings, ...rest){
      return strings[0] + rest.map((e, i)=>`${e}${strings[i+1]}`).join('');
  }
  
  console.log(zipTag`${a} + ${b} = ${a + b}`); // 6 + 9 = 15
  ```

- 原始字符串获取, 可以使用String.raw标签函数，从而获取到不是被转换后的字符

  ```js
  console.log(`hello\nworld`);
  // hello
  // world
  
  console.log(String.raw`hello\nworld`) // "hello\nworld"
  ```

  > 但是对于实际的换行符号是不可以的


### Symbol

符号属性是对内存中符号的一个引用

#### 1.基本用法

```js
let sym = Symbol();
let symV = Symbol('V');
typeof sym; // symbol
```

> 这里不可以使用像Boolean, String, Number那样使用构造函数初始化包装对象

```js
let sym = new Symbol(); // TypeError: Symbol is not a constructor
```

#### 2.创建全局符号注册表

`Symbol.for()`全局创建符号实现 共享 重用

```js
let globleSym = Symbol.for("mine");
```

第一次调用Symbol.for()会去全局注册一个符号，如果再次调用则直接从注册表中检查，并且返回该符号实例；

全局注册和使用普通方式定义的符号实例不等

```js
let a = Symbol.for('hello');

let b = Symbol.for('hello');

let c= Symbol('hello');

a === b // true
a === c // false
```

> 传给Symbol.for()函数的任何值都会被转换为字符串
>
> let empty = Symbol.for();
>
> empty // Symbol(undefined);



可以使用 `Symbol.keyFor()`来查询**全局注册表**，这个方法接受符号，返回该全局符号对应的字符串键（如果没有则返回undefined, 如果传入的不是符号则会报错

``` js
let s = Symbol.for('foo');
console.log(Symbol.keyFor(s)); // foo	

let a = Symbol('bar');
console.log(Symbol.keyFor(a)); // undefined
```



#### 3. 使用符号作为属性

凡是可以使用字符串或数值作属性的地方都可以使用符号，包扩了`Object.defineProperty() ` / `Object.defineProperties()`定义属性

```js
let s1 = Symbol('hello'), s2 = Symbol('world'), s3 = Symbol('beauty');
let o = {
    [s1]: '1212'
};
console.log(o); // {Symbol(hello): 1212}

Object.defineProperties(o, {
    [s2]: 'ssss',
    [s3]: '2121'
})
```

-  Object.getOwnPropertyNames()返回对象实例的常规属性数组
- Object.getOwnPropertySymbols()返回对象实例的符号属性数组
- Object.getOwnPropertyDescriptors()返回同时包含常规和符号属性描述符的对象
- Reflect.ownKeys()会返回两种类型的键

#### 4.常用的内置符号

ES6引入了一些常用的内置符号，用于暴露语言内部的行为，开发者可以直接访问，重写或者模拟这些行为

> 改变原生行为。比如for-of循环会在相关对象上使用Symbol.iterator属性，那么就可以通过在自定义的对象上面重新定义这个[Symbol.iterator]从而改变for-of遍历对象时候的行为



##### 1） Symbol.asyncIterator （异步迭代器符号）(ES2018)

这个符号作为一个属性，标识一个方法，该方法返回对象默认的AsyncIterator，由for-await-of语句使用，也就是异步迭代API函数

```js
class Foo{
    async *[Symbol.asyncIterator](){}
}
let f = new Foo();
console.log(f[Symbol.asyncIterator()]);

// AsyncGenerator(<suspended>)
```

由此符号函数生成的对象应该显式通过next()方法陆续返回Promise实例，也可以隐式通过异步生成器函数返回

```js
class Emitter { 
	constructor(max){
        this.max = max;
        this.index = 0;
    }
    async *[Symbol.asyncIterator](){
        while(this.index< this.max){
            yield new Promise((resolve)=>resolve (this.index++));
        }
    }
}

async function count(number){
    let emitter = new Emitter(number);
    for await(const x of emitter){
        console.log(x)
    }
}

count(5);
// 0
// 1
// 2
// 3
// 4
// 
```



##### 2) Symbol.hasInstance

标识一个方法，决定一个构造器对象是否认可一个对象式它的实例。由`instanceof` 操作符使用

```js
function Foo(){}
let f = new Foo();
console.log(f instanceof Foo); // true
console.log(Foo[Symbol.hasInstance](f)) // true;

class FlaseInstance(){
    static [Symbol.hasInstance](){
        return false
    }
}

let a = new FalseInstance();
console.log(a intanceof FalseInstance) //false
```

##### 3) Symbol.isConcatSpreadable

标识一个布尔值，如果是true以为着对象改用Array.prototype.concat()打平其数组元素。

ES6中的`Array.prototype.concat()`方法会根据接收到的对象类型选择如何将一个类数组对象拼接成数组实例。

如值为false，则会导致整个对象被追加到数组末尾，其他不是类数组对象的对象在true情况下会被忽略

```js
let init = ['foo'];

let arr = ['bar'];
console.log(arr[Symbol.isConcatSpreadable]) // undefined
console.log(init,concat(arr)) // ['foo', 'bar']
arr[Symbol.isConcatSpreadable] = false;
console.log(init.concat(arr)) // ['foo', Array(1)];

let likeObj = { length:1, 0: 'bar'};
console.log(likeObj[Symbol.isConcatSpreadable]); //undefined
console.log(init.cancat(likeObj)) // ['foo', {...}];
likeObj[Symbol.isConcatSpreadable] = true;
console.log(init.concat(likeObj)) // ['foo', 'bar']
```

##### 4) Symbol.iterator

标识一个方法，返回对象默认迭代器，由`for-of`语句使用

这与上面的Symbol.asyncIterator相类似

```js
class Bar {
	constructor(max){
		this.max = max;
		this.index = 0;
	}
	*[Symbol.iterator](){
		while(this.index < this.max){
			yield this.index++;
		}
	}
}

function count(){
	let bar = new Bar(5);
	for(const x of bar){
		console.log(x)
	}
}
// 0
// 1
// 2
// 3
// 4
```

##### 5) Symbol.match

标识一个正则表达式的方法，该方法用正则表达式去匹配字符串；

由`String.prototype.match()`方法使用，使用以Symbol.match为键的函数来对这个正则表达式求值。正则表达式的原型上默认有这个函数的定义

```js
console.log(RegExp.prototype[Symbol.match]);
// f [Symbol.match]() { [native code] }
console.log('foobar'.match(/bar/));
// ["bar", index: 3, input: "foobar", groups: undefined]
```

给这个方法传入非正则的表达式值会导致该值呗转换为RegExp对象，如果想要改变这行为，允许方法直接使用参数，则重新定义Symbol.match

```js
class FooMatcher {
     static [Symbol.match](target){
         return target.includes('foo')
     }
}

console.log('foobar'.match(FooMacther)) // true;

class StringMatcher{
    constructor(str){
        this.str = str;
    }
    [Symbol.match](target){
        return target.includes(this.str);
    }
}

console.log('foobar'.match(new StringMacther('foo'))) // true
```

##### 6) Symbol.replace

标识一个正则表达式的方法，替换一个字符串中匹配的子串；

由`String.prototype.replace()`方法会使用以Symbol.replace为键的函数来对正则表达式求值, 和上面的match一样，为了阻止默认的非正则表达式值被强行转换为RegExp对象，可以覆盖默认行为

```js
class FooReplacer {
    static [Symbol.replace](target, replacememt) {
        return target,split('foo').join(replacement);
    }
}
console.log('barfoobaz'.replace(FooReplacer, 'quz'));
// barquxbaz

class StringReplacer {
    constructor(str){
        this.str = str;
    }
    [Symbol.replace](target, replacement){
        return target.split(this.str).join(replacement);
    }
}
console.log('barfoobaz'.replace(new StringReplacer('foo'), 'quz'));
// barfoobaz
```

##### 7）Symbol.search

标识一个正则的方法，返回字符串中匹配正则表达式的索以。

由`String.prototype.search()`方法使用。String.prototype.search()方法会使用以Symbol.search为键的函数来对正则表达式进行求值, 同样和上述两个方法一样，为了阻止默认的行为，可以覆盖

```js
console.log('foobar'.search(/bar/)); //3

class StringSearcher {
	constructor(str){
		this.str = str;
	}
	[Symbol.search](target){
		return target.indexOf(this.str);
	}
}

console.log('foobar'.search(new StringSeacher('foo'))); // 0
```

##### 8) Symbol.species

标识一个属性。表示一个函数值，该函数作为创建派生对象的构造函数。

用Symbol.specied定义静态的获取器（getter）方法，可覆盖

```js
class Bar extends Array {}
class Baz extends Array {
    static get [Symbol.species](){
        return Array;
    }
}

let bar = new Bar();
console.log(bar instanceof Array) // true;
console.log(bar instanceof Bar) // true;

let baz = new Baz()
console.log(baz instanceof Array) // true
console.log(baz instanceof Baz) // true
baz = baz.concat('baz');
console.log(baz instanceof Array) // true
console.log(baz instanceof Baz) // false
```

##### 9) Symbol.toPrimitive

标识一个属性标识一个方法，该方法将对象转换为相应的原始值。有ToPrimitive抽象操作使用

很多内置操作都会尝试强制将对象转换为原始的值，包括字符串数值和未指定的原始类型。对于一个自定义对象实例，通过这个实例的Symbol.toPrimitive属性覆盖默认行为

```js
class Foo{}
let foo = new Foo();
console.log(3 + foo); // 3[object Object]
console.log(3 - foo); // NaN
console.log(String(foo)); // [object Object]

class Baz{
    constructor(){
        this[Symbol.toPrimitive] = function(hint){
            switch(hint){
				case 'number':
                    return 3;
                case 'string':
                    return 'string bar';
                case 'default':
                default:
                    return 'default bar';
            }
        }
    }
}

let bar = new Bar();

console.log(3 + bar) // 3default bar
console.log(3 - bar) // 0
console.log(String(3)) // string bar
```





##### 10）Symbol.toStringTag

标识一个属性表示一个字符串，该字符串用再创建对象的默认字符串描述。由内置方法Object.prototype.toString()使用

通过toString()方法获取对象标识时候，会自动检索由Symbol.toStringTag指定的实例表示符号，默认为"Object"。

内置类型以及指定了这个值，自定义类实力还是需要明确定义的

```js
let s = new Set();

console.log(s) // Set(0){}
console.log(s.toString()); // [object Set];
console.log(s[Symbol.toStringTag]); // Set

class Baz{
    constructor(){
        this[Symbol.toStringTag] = "Bar";
    }
}

let baz = new Baz(); // Baz {}
console.log(baz.toString()) // [object Baz]
console.log(baz[Symbol.toStringTag]) // Baz


```







