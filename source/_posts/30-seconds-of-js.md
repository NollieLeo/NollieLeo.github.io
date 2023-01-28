---
title: 30-seconds-of-js
date: 2020-07-24 14:07:43
tags:
- Javascript
categories:
- Javascript
---


# 方法
## - 对象转queryStrings

通过Object.entries以及reduce进行queryString的累加，只能将对象中值为string的转进去，可以改进

```javascript
const objectToQuerystring = (queryParams) => {
    return Object.entries(queryParams).reduce((queryString, [key, value], index) => {
        const symbol = queryString.length === 0 ? '?' : '&';
        queryString += typeof value === 'string' ? `${symbol}${key}=${value}` : '';
        return queryString;
    }, '');
}

// ?name=weng&address=11111
```

## - 深度冻结一个对象

使用Object.keys（）获取所传递对象的所有属性，使用Array.prototype.forEach（）遍历它们。 在所有属性上递归调用Object.freeze（obj），检查是否使用Object.isFrozen（）冻结了每个属性，并根据需要应用deepFreeze（）。 最后，使用Object.freeze（）冻结给定的对象。

```javascript
const deepFreeze = obj => {
  Object.keys(obj).forEach(prop => {
    if (typeof(obj[prop]) === 'object' && !Object.isFrozen(obj[prop]))   deepFreeze(obj[prop]);
  });
  return Object.freeze(obj);
};


EXAMPLES
'use strict';

const o = deepFreeze([1, [2, 3]]);

o[0] = 3; // not allowed
o[1][0] = 4; // not allowed as well
```

## - 获取当前url（不带任何参数）

返回没有任何参数的当前URL。

使用String.prototype.indexOf（）检查给定的url是否具有参数，使用String.prototype.slice（）删除它们（如有必要）。

```javascript
const getBaseURL = url =>
  url.indexOf('?') > 0 ? url.slice(0, url.indexOf('?')) : url;
```

## - 获取当前URL下的值

返回一个包含当前URL参数的对象。

使用带有适当正则表达式的String.prototype.match（）来获取所有键值对，使用Array.prototype.reduce（）来映射它们并将它们组合成一个对象。 传递location.search作为参数以应用于当前网址。

```javascript
const getURLParameters = url =>
    (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce(
    (a, v) => ((a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a),
    {}
);
```



# JavaScript api

## -for in , for of 和 forEach

### for in 

for ... in用于迭代对象的所有可枚举属性，包括继承的可枚举属性。 该迭代语句可用于数组字符串或普通对象，但不能用于Map或Set对象。

```javascript
for (let prop in ['a', 'b', 'c']) 
  console.log(prop);            // 0, 1, 2 (array indexes)

for (let prop in 'str') 
  console.log(prop);            // 0, 1, 2 (string indexes)

for (let prop in {a: 1, b: 2, c: 3}) 
  console.log(prop);            // a, b, c (object property names)

for (let prop in new Set(['a', 'b', 'a', 'd'])) 
  console.log(prop);            // undefined (no enumerable properties)
```

### for of

for ... of用于迭代可迭代对象，迭代其值而不是其属性。 该迭代语句可用于数组，字符串，Map或Set对象，但不能用于普通对象。

```javascript
for (let val of ['a', 'b', 'c']) 
  console.log(val);            // a, b, c (array values)

for (let val of 'str') 
  console.log(val);            // s, t, r (string characters)

for (let val of {a: 1, b: 2, c: 3}) 
  console.log(prop);           // TypeError (not iterable)

for (let val of new Set(['a', 'b', 'a', 'd'])) 
  console.log(val);            // a, b, d (Set values)
```



### forEach

forEach（）是Array原型的一种方法，它允许您遍历数组的元素。 尽管forEach（）仅迭代数组，但它可以在迭代时访问每个元素的值和索引。

```javascript
['a', 'b', 'c'].forEach(
  val => console.log(val)     // a, b, c (array values)
);

['a', 'b', 'c'].forEach(
  (val, i) => console.log(i)  // 0, 1, 2 (array indexes)
);	
```

