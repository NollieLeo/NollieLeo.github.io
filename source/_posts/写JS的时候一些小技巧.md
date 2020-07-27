---
title: 写JS的时候一些小技巧或者常用操作
date: 2020-07-11 00:27:18
tags: 
- js
categories:
- js
---

>  记录一些平时开发过程或者编写JS过程小技巧或者注意事项

## 关于数组

### - 变量赋值

```javascript
const array = new Array();  // 一般不这样搞一个数组

const array = [];  // 这样搞才棒
```

### - 数组浅拷贝

一般不用一个循环将数组复制一个

```javascript
const arr = [1,2,3];

//复制
const arrCopy = [ ...arr ] // 直接用拓展运算符
```

### - 类数组转成数组

```javascript
const fakeArr = [0:'hello',1:'world',2:'shit',length:3];

// bad
const arr = Array.prototype.slice.call(arrLike)

// good
const arr = Array.from(arrLike);
```

### - 数组解构

```javascript
const arr = [1, 2, 3, 4]

// bad
const first = arr[0]
const second = arr[1]

// good
const [first, second] = arr; // 注意不像对象那样是{}符号，而是[]
```

### - 二维数组转一维数组

```javascript
const arr = [[1,2,3,4],[5,6,7]];
[].concat.apply(...arr); // [1,2,3,4,5,6,7] 确保在此数组是纯二维数组的情况下

const arr = [[1,2,3,4],[5,6],7]; // 类似这样的不能用以上的方法转一维数组，可以用es6的flat
arr.flat(); // [1,2,3,4,5,6,7]
```



### - 多维数组转一维数组

```javascript
const arr = [1,2,3,[[4,5],7,6],[0,10,8]];
arr.flat(Infinity); // 这个玩意牛逼

// 当兼容性不好的时候
var arr = [1,[2,3],[4,[5,6,[7]]]]
while(arr.some(Array.isArray)){
 arr = [].concat(...arr)
} // 一招搞定
```



### - 判断数组中是否存在某个值

```javascript
const arr = [1,2,3,4,5,6];
arr.indexOf(1)!==-1 // true  方法1

arr.includes(1) // true  方法2

arr.find(item => item === 1); // 返回数组中满足条件的第一个元素的值，如果没有，返回undefined

```



### - 数组累加累乘

```javascript
const arr = [1,2,3,4,5,6];
// 累乘
arr.reduce((t,v)=>t*v,1); // t就是总乘积
eval(arr.join('*')); // eval会将传进去的string用作js代码执行

// 累加
arr.reduce((t,v)=>t+v,0);
eval(arr.join('+')); // eval会将传进去的string用作js代码执行

```



---



## 关于对象

### - 对象结构赋值

> 更推荐使用扩展运算符 ...，而不是 Object.assign。解构赋值获取对象指定的几个属性时，推荐用 rest 运算符，也是 ...。 

```javascript
const obj = {
	name:'hello',
	age:23,
};

// bad
const copy = Object.assign({}, obj, { c: 3 }) // copy => { name: 'hello', age: 23, c: 3 }

// so good
const objCopy = { ...obj, address:'beijing' }; // objCopy => {name: 'hello', age: 23,address:'beijing'}

// 解构拆分对象得时候
const {address,...restObj} = objCopy; // address = 'beijing' resObj ={name:'hello',age:23,}

```

### - 对象属性值的缩写

```javascript
const age = 23;
const name = 'wengkaimin';

// bad 
const Obj = {
	name:name,
	age:age,
}

//good
const objG = {
	name,
	age,
}
```

> 属性的缩写要放在对象的开头才舒服点

```javascript
// bad 
const Obj = {
	address:'beijing'
	name,
	age,
}

//good
const objG = {
	name,
	age,
	address:'beijing'
}

```
### - 使用动态对象属性创建对象

```javascript
function getName({name}){
	return `VIP${name}`
}

const obj = {
	age:23,
	realName:'wengkaimin',
	[getName('xiaohua')]: true,
} 
clg(obj)  // obj=> {age:23,realName:'wengkaimin',VIPxiaohua:true}
```

### - 对象里存在方法时候

```javascript
// bad
const obj = {
	name:'hello world',
	getName:function(){
		return this.name
	},
}

// goooooood 
const obj = {
	name:'hello world',
	getName(){
		return this.name
	},
}
```

### - 不要直接调用Object原型中的方法

> Object.prototype 中的hasOwnProperty，isPrototypeOf等等，不能写出object.hasOwnProperty



```javascript
const objTest = {name:'1',hasOwnProperty:true};

//bad 
console.log(objTest.hasOwnProperty(key)) // error 这玩意hasOwnProperty在这个对象中是属性，从原型链最顶层找的话第一层就被找到了，就不会再去找objTest的原型下的hasOwnProperty函数了

// goooood
console.log(Object.prototype.hasOwnProperty.call(objTest,name)); // '1'

// best 
const has = Object.prototype.hasOwnProperty // 存起来，这个模块内就可以多次查找,就不需要每次写那么长
console.log(has.call(objTest,name));
/* or */
import has from 'has'; // https://www.npmjs.com/package/has
console.log(has(object, name));
```

### - 



## 关于函数

### - 函数参数使用默认值替代使用条件语句进行赋值。

```javascript
// good
function newFun(name = 'Jack') {
   ...
}

// bad
function newFun(name) {
  const userNameName = name || 'Jack'
   ...
}

```

### - 函数参数使用结构语法

> 函数参数越少越好，如果参数超过两个，要使用 ES6 的解构语法，不用考虑参数的顺序。

```javascript
// good
function createMenu({ title, body, buttonText, cancellable }) {
   ...
}

createMenu({
  title: 'Foo',
  body: 'Bar',
  cancellable: true,
  buttonText: 'Baz',
})

// bad
function createMenu(title, body, buttonText, cancellable) {
  // ...
}

```

###  - 优先使用 rest 语法...，而不是arguments 

```javascript
// bad
function concatenateAll() {
  const args = Array.prototype.slice.call(arguments) // arguments是伪数组，处理成数组，这里用上面说的Array.from(arguments)才好
  return args.join('')
}

// good
function concatenateAll(...args) {
  return args.join('')
}

```



