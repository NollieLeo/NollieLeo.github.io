---
title: js对象属性详解
date: 2021-05-27 20:21:37
tags:
- js
- object
categories:
- js
---



> ECMA-262使用一些内部特性来描述属性的特征。这些特征是由为js实现引擎的规范定义的，开发者在js中不能直接访问这些特性，描述内部特性，一般会把这个特性括起来类似这样`[[Enumerable]]`

# 属性的类型

属性分两种 

1. 数据属性
2. 访问器属性

## 1. 数据属性

数值属性包含一个保存数据值的位置。

以下有4种特性描述他们的行为

- `[[Configurable]]`： 表示属性以下特性。（默认情况下是true）

  - 是否可以通过 **delete删除**并且**重新定义**

  - 可以修改他的特性

  - 是否可以把它**改为访问器属性**

- `[[Enumberable]]`：表示属性。（默认情况是true）

  - 是否可以通过 `for-in`循环返回

- `[[Writable]]`：表示这个属性的值是否可以被修改呢，默认情况为true

- `[[Value]]`：包含属性实际的值。（这个就是数据属性保存数据值的位置，值会从这个位置读取，以及写入）默认值是`undefined`

### 1. 修改属性的默认特性

例如：

```js
let person = {
	name: 'weng'
}
// 这里name属性的特性[[Value]]就会被赋值为 weng
// 而其他的特性默认都是为true
```

假如要 修改特性需要用到对象的 `Object.defineProperty`方法

这个方法接受三个参数

要给添加属性的对象，属性名称， 一个描述符对象（就是相关特性的描述属性，configurable，writable, enumerable, value）

```js
let person = {};
Object.defineProperty(person, "name", {
    writable: false,
    value: 'weng'
});
// 这里设置了`[[Writable]]`属性为false，表示这个属性不能再被修改了
console.log(person.name) // weng
person.name = 'helloworld';  // 修改无效
console.log(person.name) // weng
```

> 上述这种情况，在严格模式之下尝试修改属性会抛出错误



创建一个不可配置的属性如下

```js
let person = {};
Object.defineProperty(person, 'name', {
    configurable: false,
    value: 'weng'
})
// 这里把对象的[[Configurable]]特性设置为false
delete person.name;  // 删除无效
console.log(person.name) // weng
```

> 这里如果修改了[[Configurable]]特性为不可配置，之后都不能再变回可配置的了，如果再调用Object.defineProperty把这个特性设置为true会报错
>
> 并且设置这个特性为false，如果没有定义其他特性，那么其他特性都默认为false





## 2. 访问器属性

访问器属性是不包含数据值的。

他们包含一个（getter）函数和一个（setter）函数；

读取属性时候调取 getter 决定了应该怎么返回值，

设置属性的时候调用 setter，setter函数告诉你怎么对数据做出修改

有四个属性描述他们的行为

- `[[Configurable]]`：默认情况下为true
  - 是否可通过delete删除并重新定义
  - 是否可以修改它的特性
  - 是否可以把他改为数据属性
- `[[Enumerable]]`： 默认情况下为true
  - 表示属性是否可以通过 `for-in`循环-
- `[[Get]]`： 获取函数，在读取属性时候调用。默认值为undefined
- `[[Set]]`： 设置函数，在写入属性时候调用。默认值为undefined

和数据属性一样，访问器的属性也是不能直接定义的，必须使用Object.defineProperty()

如下例子：

```js
const book = {
    year_: 2021, // 表示私有属性不能被外部访问
    edition: 1
}
Object.defineProperty(book, "year", {
    get(){
        return this.year_;
    }
    set(newValue){
    	if(newValue > 2021){
            this.year_ = newValue;
            this.edition += newValue - 2021
        }
	}
})

book.year = 2022;
console.log(book.edition) // 2
```

以上是访问器属性的经典使用场景

>  获取函数和设置函数不一定都需要定义
>
> 只定义获取函数意味着属性是只读的



当然可以以上的Object.defineProperty只能定义单个属性，可以使用Object.defineProperties来定义多个属性值以及特性



```js
let book = {}
Object.defineProperties(book, {
    year_:{
        value: 2021
    },
    edition:{
        value: 1
    },
    year: {
        get(){
            ....
        }
        set(){
    		....
		}
    }
})
```



# 读取属性的特性

## 1. Object.getOwnPropertyDescriptor()

使用 Object.getOwnPropertyDescriptor()方法可以获取指定属性的属性描述符。

接受两个参数

属性所在对象，以及要取得其描述符号的属性名（数据属性，和访问器属性）。返回一个对象

例如：

```js
let book = {};
Object.defineProperties(book, {
    year_:{
        value: 2021
    },
    edition:{
        value: 1
    },
    year: {
        get(){
            ....
        }
        set(){
    		....
		}
    }
})
let desc = Object.getOwnPropertyDescriptor(book,"year_");
let descYear = Object.getOwnPropertyDescriptor(book, "year");

```

desc的值如下

![image-20210527212616268](image-20210527212616268.png)

![image-20210527212733518](image-20210527212733518.png)

descYear值如下：

![image-20210527212917495](image-20210527212917495.png)

![image-20210527213001469](image-20210527213001469.png)





## 2. Object.getOwnPropertyDescriptors()

es2017新增的静态方法，这个方法会在每个自有属性上调用Object.defineProperties

```js
console.log(Object.getOwnPropertyDescriptors(book));
```

打印出来的如下

![image-20210527214742659](image-20210527214742659.png)