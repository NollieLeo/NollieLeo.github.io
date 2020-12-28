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



### - 数组排序

> sort是浏览器内置方法 

```javascript
const arr = [1,2,3,4,5];
arr.sort((a,b)=>a-b);
arr.sort((a,b)=>b-a);
```




### - 数组浅拷贝

一般不用一个循环将数组复制一个

```javascript
const arr = [1,2,3];

//复制
const arrCopy = [ ...arr ] // 直接用拓展运算符
```

### - 多个数组合并

```javascript
const arr1 = [1,2,3,4];
const arr2 = [5,6,7,8];
arr3 = [...arr1,...arr2];
// [1,2,3,4,5,6,7,8];
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

### - 替换数组中的特定值

```javascript
const arr = [1,2,3,4,5];
arr.splice(0,2,"hello","world"); // 0~2 开始 2除外开始按顺序替换值
// ['hello','world',3,4,5]

```

### - Array.from 替换map效果

```javascript
const arr = [
	{
		name:'weng',
		age:21,
	},
	{
		name:'wang',
		age:11,
	},
	{
		name:'sange',
		age:41
	},
];
Array.from(arr,({name})=>name); // ['weng','wang','sange'];
```



### - 数组去重

```javascript
const arr = [1,2,3,4,5,5,6,6,7,7,10,10];

const uniqueArr = Array.from(new Set(arr));
const uniqueArr = [ ...new Set(arr) ]; // good
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

### - 去除数组中的空对象

```javascript
const arr = [{name:1,age:2},{},{}];
const deleteObj=(arr)=>{
	if(Array.isArray(arr) && arr.length>1){
		arr.filter(item => {
			return Object.keys(item).length>0
		})
	}
	return [];
}
```

### - 数组中的所有值是否都满足条件

> 如果提供的谓词函数对集合中的所有元素返回true，则返回true，否则返回false。

```javascript
const all = (arr, fn = Boolean) => arr.every(fn);
all([4,2,3],x=> x>1) // true
all([1,2,3],x=>x>1) // false;
```



### - 数组中是否有一项满足

```javascript
[1,2,3].some(item => item >2);
```



### - 判断数组中是否存在某个值

```javascript
const arr = [1,2,3,4,5,6];
arr.indexOf(1)!==-1 // true  方法1

arr.includes(1) // true  方法2

arr.find(item => item === 1); // 返回数组中满足条件的第一个元素的值，如果没有，返回undefined

```

### - 返回两个数组不一样的值

```javascript
const difference = (a,b)=> {
	const s = new Set(b);
	return a.filter(x=>!s.has(x));
}

difference([1,2,3],[3]) // [1,2];
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



### - 将数组转换为对象

```javascript
const arr = ['weng','wang','zhang','li'];
objArr = {...arr};
// {0:'weng',1:'wang',2:'zhang',3:'li'}
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

### - 浅拷贝

```javascript
const shallowClone = obj => Object.assign({},obj);// 上面说了不推荐这样写法

const shallowClone = obj => {...obj};

```

### - 深拷贝

```javascript
const deepMapKeys = (obj, fn) =>
  Array.isArray(obj)
    ? obj.map(val => deepMapKeys(val, fn))
    : typeof obj === 'object'
    ? Object.keys(obj).reduce((acc, current) => {
        const key = fn(current);
        const val = obj[current];
        acc[key] =
          val !== null && typeof val === 'object' ? deepMapKeys(val, fn) : val;
        return acc;
      }, {})
    : obj;
```





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

### - 函数返回值是多个的情况下

```javascript
// 当我们调用函数并将值分配给 a,b,c,d 时，我们需要注意返回数据的顺序。这里的一个小错误可能会成为调试的噩梦,而且倘若只需要c,d值，那么就无法确切获取
const func =()=>{
 	const a = 1;
 	const b = 2;
	const c = 3;
    const d = 4;
 	return [a,b,c,d]; // very bad
}
const [a,b,c,d] = func();

// 使用对象结构
const func =()=>{
 	const a = 1;
 	const b = 2;
	const c = 3;
    const d = 4;
 	return {a,b,c,d}; // good
}
const {c,d} = func();

```





## 关于字符串

### - 字符串翻转

```javascript
function reverseStr(str = "") {
  return str.split("").reduceRight((t, v) => t + v);
}

const str = "reduce123";
console.log(reverseStr(str)); // "321recuder"

```



## 关于数字

### - 判断奇偶数

```javascript
const num=5;
!!(num & 1) // true
!!(num % 2) // true
```

### - 数字千分位

```javascript
// 方法一
function thousandNum(num = 0) {
  const str = (+num).toString().split(".");
  const int = nums => nums.split("").reverse().reduceRight((t, v, i) => t + (i % 3 ? v : `${v},`), "").replace(/^,|,$/g, "");
  const dec = nums => nums.split("").reduce((t, v, i) => t + ((i + 1) % 3 ? v : `${v},`), "").replace(/^,|,$/g, "");
  return str.length > 1 ? `${int(str[0])}.${dec(str[1])}` : int(str[0]);
}

thousandNum(1234); // "1,234"
thousandNum(1234.00); // "1,234"
thousandNum(0.1234); // "0.123,4"
console.log(thousandNum(1234.5678)); // "1,234.567,8"

// 方法二
(121314).toLocaleString();
```



### - 字符串转数字

#### 方法一

> 实际就是用 *1来转化为数字，实际上是调用了`.valueOf`的方法

```javascript
'32' * 1 // 32
'ds' * 1 // NaN
null * 1 // 0
undefine * 1 // NaN
1 * { valueOf:()=>'3'};
```

#### 方法二

```javascript
+ '123' // 123
+ 'ds' // NaN
+ '' // 0
+ null // 0
+ undefine // NaN
+ {valueOf: ()=>'3'} // 3 
```

### - 判断小数是否相等

#### 方法1：

```javascript
Number.EPSILON=(function(){   //解决兼容性问题
    return Number.EPSILON?Number.EPSILON:Math.pow(2,-52);
})();
//上面是一个自调用函数，当JS文件刚加载到内存中，就会去判断并返回一个结果
function numbersequal(a,b){ 
    return Math.abs(a-b)<Number.EPSILON;
  }
//接下来再判断   
const a=0.1+0.2, b=0.3;
console.log(numbersequal(a,b)); //这里就为true了

```

#### 方法2：

```javascript
(0.1*100+0.2*100)/100===0.3
```



### - 双位运算符

> 双位运算符比`Math.floor()`和`Math.ceil()`速度快

```javascript
~~7.5                // 7
Math.ceil(7.5)       // 8
Math.floor(7.5)      // 7


~~-7.5        		// -7
Math.floor(-7.5)     // -8
Math.ceil(-7.5)      // -7

```

所以负数时，双位运算符和Math.ceil结果一致，正数时和Math.floor结果一致

### - 取整和奇偶性判断

取整

```javascript
3.3 | 0         // 3
-3.9 | 0        // -3

parseInt(3.3)  // 3
parseInt(-3.3) // -3

// 四舍五入取整
Math.round(3.3) // 3
Math.round(-3.3) // -3

// 向上取整
Math.ceil(3.3) // 4
Math.ceil(-3.3) // -3

// 向下取整
Math.floor(3.3) // 3
Math.floor(-3.3) // -4

```

判断奇偶

```javascript
const num=5;
!!(num & 1) // true
!!(num % 2) // true
```



## 布尔型