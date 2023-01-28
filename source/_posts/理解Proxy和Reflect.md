---
title: 理解Proxy和Reflect
date: 2022-09-03 10:43:45
tags:
- Proxy
- Reflect
- 响应式
- Vue

categories:
- Javascript
---

# 理解Proxy

> Vue3中利用的是Proxy以及Reflect去代理对象的

我们知道Proxy是只能代理对象类型的，非对象类型不可以进行代理

所谓代理：

> 指的是对一个 对象 的 **基本语义** 的代理

## 何为基本语义

比如我们对对象的一堆简单操作

```js
console.log(obj.a); // 读取属性操作
obj.a++; // 设置属性值操作
```

类似这种读取，设置属性值的操作，就是属于基本的语义操作 ---- **基本操作**

类似这种的基本操作就可以用Proxy进行代理拦截

基本操作的基本用法

```js
const data = new Proxy(obj, {
  // 拦截读取属性操作
  get(){ .... },
  // 拦截设置属性操作
  set(){  .... }
})
```



例如函数：我们也可以使用apply对函数进行拦截

```js
const fn = ()=>{
  console.log('wengkaimin')
}

const proFn = new Proxy(fn, {
  apply(target, thisArg, argArray){
    target.call(thisArg, ...argArray)
  }
})
```



## 复合操作

既然有基本操作，可以也有非基本操作，在js里头，我们叫他复合操作

```js
obj.fn()
```

这个显而易见，是又多个语义构成的（调用一个对象的一个函数属性）、

两个语义是：

1. 首先通过get获取到obj的fn属性
2. 通过获取到的fn进行调用



# 理解Reflect

> Reflect是一个全局对象，其中存在和Proxy的拦截器很多名字相同的方法

如下的等价操作

```js
const obj = { a: 'wengkaimin' };
console.log(obj.a);
console.log(Reflect.get(obj, 'a'));
```

但是Reflect它能够传入第三个参数 reveiver

就相当于函数执行过程中，指向的this

```js
console.log(Reflect.get(obj, 'a', { a: 'kaimin' })); // kaimin
```



> 在vue3响应式学习 整理的那篇文章中，记录了实现 响应式代理的代码

```js
const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    // 返回函数属性
    // 这里没有用Reflect.get实现读取数据
    return target[key];
  },
  set(target, key, newVal) {
    target[key] = newVal;
    trigger(target, key);
  },
});
```

我们在Proxy中无论设置get还是set拦截，都是直接用的原始对象target来进行读取或者赋值



假如目前的obj为，返回了this.foo的值。

接着我们在effect副作用函数中通过代理对象data读取b的值。

之后我们修改了a的值

```js
const obj = {
  a:1,
  get b(){
    return this.a + 1;
  }
}

const data = new Proxy(obj, {
  get(target, key) {
    track(target, key);
    // 返回函数属性
    // 这里没有用Reflect.get实现读取数据
    return target[key];
  },
  set(target, key, newVal) {
    // 这里没有用Reflect.set
    target[key] = newVal;
    trigger(target, key);
  },
})

effect(()=>{
  console.log(data.b) // 2
})

data.a++
```

修改了a的值之后，并不会相对应的触发副作用函数的重新执行

梳理下读取步骤：

1. 首先我们在副作用函数中读取了data.b的值
2. 会触发data代理对象的get拦截器，在get拦截器中，通过target[key]读取;
3. 此时target就指的是 obj 原始对象，key就是 'b'，所以相当直接读了obj.b
4. 访问obj.b的时候，其实是一个getter函数，这个getter的this指向了obj，最终实质上是访问了 obj.a 并且给他加了个1

当然，在副作用函数effect当中相当于，直接读取了原生对象obj的属性，虽然看上去走了代理，但不多。所以这肯定是没有追踪到的，建立不起相应的联系

就类似

```js
effect(()=>{
  console.log(obj.a + 1) // 2
})
```

在这种场景下Reflect的第三个参数receiver就派上用场了

使用Reflect改造完get拦截器

```js
const obj = new Proxy(data, {
  get(target, key, receiver) {
    track(target, key);
    // 返回函数属性
    return Reflect.get(target, key, receiver)
  },
  set(target, key, newVal) {
    target[key] = newVal;
    trigger(target, key);
  },
});
```

使用了Relfect之后，this指向就转为了data代理对象，就可以成功的建立联系了

>  Reflect的作用不仅于此
