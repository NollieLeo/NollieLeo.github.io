---
title: 为何Vue3 Proxy 更快
date: 2022-04-21 17:46:14
tags:
- vue3
- proxy
- Object.defineProperty
---

相比于Vue2.x Object.defineProperty的响应式原理，Vue3 Proxy的优势在哪里呢。以下我们从两者源码角度分析下使用Proxy的优势。

Proxy优势：

1. ES6原生Proxy语法，更快的初始化，懒加载，不用递归的定义Object.defineProperty
2. 支持动态的添加object新属性
3. 支持原生array数组操作

假设有如下的响应式对象时：

```js
data() {
    return { a: { b: { c: { d: { e: 11 } } } } }
}
//  以上等价于以下代码
const data = { a: { b: { c: { d: { e: 11 } } } } }
// Vue2.x
Vue.observe(data)
// Vue3：
reactive(data)

 
        Copied!
    
```

## [#](https://lq782655835.github.io/blogs/vue/vue3-code-4.why-proxy-faster.html#vue2-x-object-defineproperty)Vue2.x Object.defineProperty

vue2初始化时，会递归的调用Object.defineProperty。当第一层对象属性定义后，再会递归调用下一层属性的Object.defineProperty（为了是依赖收集）。所以在初始化时Vue2.x需要更多时间，去同步递归定义Object.defineProperty操作。

另外一个缺点也可以看出，初始化时把data的属性递归遍历收集了，当data在业务运行过程中，动态新增属性该怎么办？在Vue2.x中由于不是懒加载，所以需要用户主动告诉Vue框架，告诉哪些新增属性是要去依赖收集的，这就是[Vue.set (opens new window)](https://vuejs.org/v2/api/#Vue-set)API的来由。同理[Vue.delete (opens new window)](https://vuejs.org/v2/api/#Vue-delete)。

以下是精简主流程的源码，Vue2.x中定义响应式对象API是：`Vue.observe(data)`

```js
// https://github.com/vuejs/vue/blob/dev/src/core/observer/index.js
export function observe (value: any, asRootData: ?boolean): Observer | void {
  let ob = new Observer(value)
  return ob
}

export class Observer {
  constructor (value: any) {
      this.walk(value)
  }

  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}

export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean // default: false
) {
  const dep = new Dep()
  const getter = property && property.get
  const setter = property && property.setter

  // 同步实时：递归子层级
  let childOb = !shallow && observe(val)
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      // ... dep依赖收集
      return value
    },
    set: function reactiveSetter (newVal) {
      setter.call(obj, newVal)
      // ... dep触发更新
    }
  })
}

 
        Copied!
    
```

## [#](https://lq782655835.github.io/blogs/vue/vue3-code-4.why-proxy-faster.html#vue3-proxy处理)Vue3 Proxy处理

Vue3中定义响应式对象API是：`reactive(data)`。

Proxy提供了对JS的元数据编程，即可以使用JS提供的语法特性，创建新的JS语法。

可以看到Vue3中定义响应式非常简单，即原生的 new Proxy(target, handlers)。此时这里没有递归调用初始化，即可看成是懒加载去依赖收集（用到才去依赖收集）。

再看看代理操作baseHandlers中get定义是如何的。

```js
// https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/reactive.ts
export function reactive(target: object) {
  return createReactiveObject(target)
}

function createReactiveObject(target: Target) {
  const observed = new Proxy(
    target,
    baseHandlers // {get, set, deleteProperty}
  )
  return observed
}

 
        Copied!
    
```

get定义，主要用来依赖收集，同时如果属性的value为Object对象时，自定进行Proxy代理。

```js
// https://github.com/vuejs/vue-next/blob/master/packages/reactivity/src/baseHandlers.ts
const get = createGetter()

function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)

    // ...依赖收集

    // 懒加载，当访问响应式对象时，再去构造下一个Proxy(res, { getter })
    if (isObject(res)) {
      return reactive(res)
    }

    return res
  }
}

 
        Copied!
    
```
