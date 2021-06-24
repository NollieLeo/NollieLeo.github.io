---
title: Proxy代理应用场景
date: 2021-06-15 16:55:27
tags:
- proxy
- js
categories:
- js

---



### Proxy 使用场景

#### 1 增强型数组

##### 定义 enhancedArray 函数

```javascript
function enhancedArray(arr) {
  return new Proxy(arr, {
    get(target, property, receiver) {
      const range = getRange(property);
      const indices = range ? range : getIndices(property);
      const values = indices.map(function (index) {
        const key = index < 0 ? String(target.length + index) : index;
        return Reflect.get(target, key, receiver);
      });
      return values.length === 1 ? values[0] : values;
    },
  });

  function getRange(str) {
    var [start, end] = str.split(":").map(Number);
    if (typeof end === "undefined") return false;

    let range = [];
    for (let i = start; i < end; i++) {
      range = range.concat(i);
    }
    return range;
  }

  function getIndices(str) {
    return str.split(",").map(Number);
  }
}
复制代码
```

##### 使用 enhancedArray 函数

```javascript
const arr = enhancedArray([1, 2, 3, 4, 5]);

console.log(arr[-1]); //=> 5
console.log(arr[[2, 4]]); //=> [ 3, 5 ]
console.log(arr[[2, -2, 1]]); //=> [ 3, 4, 2 ]
console.log(arr["2:4"]); //=> [ 3, 4]
console.log(arr["-2:3"]); //=> [ 4, 5, 1, 2, 3 ]
复制代码
```

由以上的输出结果可知，增强后的数组对象，就可以支持负数索引、分片索引等功能。除了可以增强数组之外，我们也可以使用 Proxy API 来增强普通对象。

#### 2 增强型对象

##### 创建 enhancedObject 函数

```javascript
const enhancedObject = (target) =>
  new Proxy(target, {
    get(target, property) {
      if (property in target) {
        return target[property];
      } else {
        return searchFor(property, target);
      }
    },
  });

let value = null;
function searchFor(property, target) {
  for (const key of Object.keys(target)) {
    if (typeof target[key] === "object") {
      searchFor(property, target[key]);
    } else if (typeof target[property] !== "undefined") {
      value = target[property];
      break;
    }
  }
  return value;
}
复制代码
```

##### 使用 enhancedObject 函数

```javascript
const data = enhancedObject({
  user: {
    name: "阿宝哥",
    settings: {
      theme: "dark",
    },
  },
});

console.log(data.user.settings.theme); // dark
console.log(data.theme); // dark
复制代码
```

以上代码运行后，控制台会输出以下代码：

```shell
dark
dark
复制代码
```

通过观察以上的输出结果可知，使用 `enhancedObject` 函数处理过的对象，我们就可以方便地访问普通对象内部的深层属性。

#### 3 创建只读的对象

##### 创建 Proxy 对象

```javascript
const man = {
  name: "semlinker",
};

const handler = {
  set: "Read-Only",
  defineProperty: "Read-Only",
  deleteProperty: "Read-Only",
  preventExtensions: "Read-Only",
  setPrototypeOf: "Read-Only",
};

const proxy = new Proxy(man, handler);
复制代码
```

##### 使用 proxy 对象

```javascript
console.log(proxy.name);
proxy.name = "kakuqo";
复制代码
```

以上代码运行后，控制台会输出以下代码：

```javascript
semlinker
proxy.name = "kakuqo";
           ^
TypeError: 'Read-Only' returned for property 'set' of object '#<Object>' is not a function
复制代码
```

观察以上的异常信息可知，导致异常的原因是因为 `handler` 对象的 `set` 属性值不是一个函数。如果不希望抛出运行时异常，我们可以定义一个 `freeze` 函数：

```javascript
function freeze (obj) {
  return new Proxy(obj, {
    set () { return true; },
    deleteProperty () { return false; },
    defineProperty () { return true; },
    setPrototypeOf () { return true; }
  });
}
复制代码
```

定义好 `freeze` 函数，我们使用数组对象来测试一下它的功能：

```javascript
let frozen = freeze([1, 2, 3]);
frozen[0] = 6;
delete frozen[0];
frozen = Object.defineProperty(frozen, 0, { value: 66 });
console.log(frozen); // [ 1, 2, 3 ]
复制代码
```

上述代码成功执行后，控制台会输出 `[ 1, 2, 3 ]`，很明显经过 `freeze` 函数处理过的数组对象，已经被 “冻结” 了。

#### 4 拦截方法调用

##### 定义 traceMethodCalls 函数

```javascript
function traceMethodCalls(obj) {
  const handler = {
    get(target, propKey, receiver) {
      const origMethod = target[propKey]; // 获取原始方法
      return function (...args) {
        const result = origMethod.apply(this, args);
        console.log(
          propKey + JSON.stringify(args) + " -> " + JSON.stringify(result)
        );
        return result;
      };
    },
  };
  return new Proxy(obj, handler);
}
复制代码
```

##### 使用 traceMethodCalls 函数

```javascript
const obj = {
  multiply(x, y) {
    return x * y;
  },
};

const tracedObj = traceMethodCalls(obj);
tracedObj.multiply(2, 5); // multiply[2,5] -> 10
复制代码
```

上述代码成功执行后，控制台会输出 `multiply[2,5] -> 10`，即我们能够成功跟踪 `obj` 对象中方法的调用过程。其实，除了能够跟踪方法的调用，我们也可以跟踪对象中属性的访问，具体示例如下：

```javascript
function tracePropAccess(obj, propKeys) {
  const propKeySet = new Set(propKeys);
  return new Proxy(obj, {
    get(target, propKey, receiver) {
      if (propKeySet.has(propKey)) {
        console.log("GET " + propKey);
      }
      return Reflect.get(target, propKey, receiver);
    },
    set(target, propKey, value, receiver) {
      if (propKeySet.has(propKey)) {
        console.log("SET " + propKey + "=" + value);
      }
      return Reflect.set(target, propKey, value, receiver);
    },
  });
}

const man = {
  name: "semlinker",
};
const tracedMan = tracePropAccess(man, ["name"]);

console.log(tracedMan.name); // GET name; semlinker
console.log(tracedMan.age); // undefined
tracedMan.name = "kakuqo"; // SET name=kakuqo
复制代码
```

在以上示例中，我们定义了一个 `tracePropAccess` 函数，该函数接收两个参数：obj 和 propKeys，它们分别表示需跟踪的目标和需跟踪的属性列表。调用 `tracePropAccess` 函数后，会返回一个代理对象，当我们访问被跟踪的属性时，控制台就会输出相应的访问日志。

#### 5 隐藏属性

##### 创建 hideProperty 函数

```javascript
const hideProperty = (target, prefix = "_") =>
  new Proxy(target, {
    has: (obj, prop) => !prop.startsWith(prefix) && prop in obj,
    ownKeys: (obj) =>
      Reflect.ownKeys(obj).filter(
        (prop) => typeof prop !== "string" || !prop.startsWith(prefix)
      ),
    get: (obj, prop, rec) => (prop in rec ? obj[prop] : undefined),
  });
复制代码
```

##### 使用 hideProperty 函数

```javascript
const man = hideProperty({
  name: "阿宝哥",
  _pwd: "www.semlinker.com",
});

console.log(man._pwd); // undefined
console.log('_pwd' in man); // false
console.log(Object.keys(man)); // [ 'name' ]
复制代码
```

通过观察以上的输出结果，我们可以知道，利用 Proxy API，我们实现了指定前缀属性的隐藏。除了能实现隐藏属性之外，利用 Proxy API，我们还可以实现验证属性值的功能。

#### 6 验证属性值

##### 创建 validatedUser 函数

```javascript
const validatedUser = (target) =>
  new Proxy(target, {
    set(target, property, value) {
      switch (property) {
        case "email":
          const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!regex.test(value)) {
            console.error("The user must have a valid email");
            return false;
          }
          break;
        case "age":
          if (value < 20 || value > 80) {
            console.error("A user's age must be between 20 and 80");
            return false;
          }
          break;
      }

      return Reflect.set(...arguments);
    },
  });
复制代码
```

##### 使用 validatedUser 函数

```javascript
let user = {
  email: "",
  age: 0,
};

user = validatedUser(user);
user.email = "semlinker.com"; // The user must have a valid email
user.age = 100; // A user's age must be between 20 and 80
复制代码
```

上述代码成功执行后，控制台会输出以下结果：

```shell
The user must have a valid email
A user's age must be between 20 and 80
```