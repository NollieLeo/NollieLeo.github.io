---
title: undefine和void()有什么区别？
date: 2020-12-25 15:23:53
tags:
- Javascript
categories:
- Javascript
---

在 JavaScript 中，判断是否是 undefined，一般都这样写：

```text
function isUndefined(input) {
    return input === void 0;
}
```

为什么要使用 void 0 呢？

void 是 JS 中的一个运算符，语法是：

```text
void expression
```

它返回 `undefined` 的原始值，同时语句中的 expression 会被运算，也即产生了副作用。可以这样理解：它运算了表达式，但是不返回值（或者说返回 undefined）。

所以，通常使用 `void 0` 来得到 `undefined`。

但是，为什么不直接使用 undefined 呢？

要弄清楚这个问题，先看看 undefined 这个词在不同语境下的含义。

1. `undefined` 是**术语（glossary）**。被用于表示一个概念时，它是一个术语，这个术语表示这样一个概念：未定义的值（即 undefined）。在 JS 中，只声明而未被赋值的变量、函数里未传实参的形参，都对应此概念。
2. `undefined` 是**类型（type）**。为了在语言层面实现上述的 `undefined` 概念，JS 为这个概念提供了一种原始类型（primitive type），即 undefined 类型。
3. `undefined` 是**值（value）**。上述的 `undefined` 类型非常特殊，不像其他诸如 `string`、`number` 类型可以定义出无限多的不同变量，undefined 类型的值只可能有一个，可以称之为 undefined 原始值（primitive value）。这个值在 JS 中没有字面量，准确的说是 JS 没有为程序员提供一个表示 undefined 原始值的字面量（可能有人会说代码里 undefined 不就是字面量吗？请看下一条）。
4. `undefined` 是**属性（undefined）**。代码中出现的  `undefined` 是全局变量的属性，所以说 JS 代码里出现的 undefined 并不是字面量。可以这样理解：JS 一开始就在内部将 undefined 原始值赋给了 undefined 属性。

现在再来回答为什么需要使用 `void 0` 而不直接用 `undefined`。

先说为什么使用 void 0。因为 void 0 返回的值是 undefined 原始值，这与我们写代码的意图完全一致。

再说为什么不使用 undefined。 因为在两种情况下它有可能与我们的意图不一致。

第一种情况：既然 undefined 是一个属性，那它就有可能被重新赋值。但是这个担心是是多余的，因为从 ES5 开始 undefined 属性就是是一个只读属性了，不可能被重新赋值。可以通过实验验证，打开 node CLI：

```text
> Object.getOwnPropertyDescriptor(global, 'undefined')
{ value: undefined,
 writable: false,
 enumerable: false,
 configurable: false }
> undefined = 'a string'
'a string'
> typeof undefined
'undefined'
```

但是即便如此，为兼容性考虑还是要避免直接拿 undefined 来做比较。

第二种情况：局部变量。因为 undefined 在 JS 中并不是保留字，所以在局部作用域中完全可以定义一个变量名为 undefined 的局部变量。看如下代码：

```js
(function(){ 
 let undefined = 'a string';
 console.log(undefined)
})()
```

代码运行的结果是: 

```text
a string
```

总结：使用 void 0 是有足够理由的。