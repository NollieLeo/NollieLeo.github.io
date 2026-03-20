---
title: vue3渲染器设计与总结
published: 2022-12-03T19:39:37.000Z
description: >-
  前置概念   虚拟 dom  vdom，虚拟 dom 就是用来表示真实的 dom 元素的属性或者特点的一套数据结构，和真实 dom
  一样具有树形结构，具有许多树形节点 vnode  可以简要的表示  js const vnode = {   type: "h1",   children:
  [    ...
tags:
  - Vue
  - diff
category: "前端开发"
---

# 前置概念

## 虚拟 dom

vdom，虚拟 dom 就是用来表示真实的 dom 元素的属性或者特点的一套数据结构，和真实 dom 一样具有树形结构，具有许多树形节点 vnode

可以简要的表示

```js
const vnode = {
  type: "h1",
  children: [
    {
      type: "h2",
      children: "我是h2",
    },
  ],
};
```

## 渲染器

渲染器的基本作用就是把虚拟 dom 渲染为平台上面的真实 元素，浏览器上就是真实的 dom 元素。

## 挂载

mounted，意思就是渲染器读取解析 vnode/vdom 属性之后，使用真实的 dom 形式并且表现在页面上/或者是具体的页面某个位置上

# 实现渲染器

## 简单的渲染原理

**renderer**: 渲染函数

就是通过 innerHTML 的形式将第一个参数 domString 插入到对应容器当中

```js
function renderer(domString, container) {
  container.innerHTML = domString;
}

renderer("<h1>vue3 renderer</h1>", document.getElementById("app"));
```

*[Image missing: /Users/leo/Library/Application%20Support/marktext/images/2022-12-03-20-32-21-image.png]*

### 结合 reactivity

引入 vue3 的 reactivity 包，他会在全局暴露一个 VueReactivity 变量

[cdn 地址](https://cdn.jsdelivr.net/npm/@vue/reactivity@3.2.45/dist/reactivity.global.min.js)

```html
<script src="https://cdn.jsdelivr.net/npm/@vue/reactivity@3.2.45/dist/reactivity.global.min.js"></script>
<script type="module">
  import { renderer } from "./render.js";

  const { effect, ref } = VueReactivity;

  const count = ref(1);

  effect(() => {
    renderer(
      `<h1>vue3 renderer times: ${count.value}</h1>`,
      document.getElementById("app")
    );
  });

  setTimeout(() => {
    count.value++;
  }, 2000);
</script>
```

通过引入 vue3 的 reactivity，我们能够实现一个动态渲染的基本逻辑

## 自定义渲染器

> vue3 中的渲染器，是设计为通用可配置的，即可实现渲染到任意目标的平台上，我们目前说的目标平台，先指定浏览器；后续可以将一些可抽象的 API 抽离，使得渲染器的核心不依赖与浏览器的 api
> 
> 这也就是 vue 的核心之一，将相关浏览器的 api 封装到了**runtime-dom**的一个包，提供了很多针对浏览器的 dom api，属性以及事件处理

### 工厂函数

首先我们创建一个 createRenderer 的工厂函数用于创建一个渲染器, 并且抛出许多的方法

```js
/** 创建一个渲染器 */
function createRenderer() {
  const render = (vnode, container) => {
    // ...
  };

  // 后续会有各种方法

  return { render };
}
```

之后进行相关的渲染调用

```js
const renderer = createRenderer();
renderer.render(vNode, document.getElementById("app"));
```

### 加入更新的概念

第一次调用

```js
renderer.render(vNode, document.getElementById("app"));
```

第二次调用渲染的时候还是在同一个 container 上调用的

```js
renderer.render(newVNode, document.getElementById("app"));
```

由于首次的渲染已经将对应的 dom 渲染到了 container 内部了，所以再次调用 render 函数的时候，渲染一个新的虚拟 dom，就单单是做一个简单的挂载的动作了，而是要进行更新对比，找出变动的节点，这个过程就叫做 - **打补丁（更新）**

因此我们可以相关的改造一下代码：

引入一个更新的概念处理的逻辑

```js
/** 创建一个渲染器 */
function createRenderer() {
  const render = (vnode, container) => {
    if (vnode) {
      // 新的node存在的情况，将其旧的vnode一起传递给patch函数进行补丁的更新
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        // 旧的vnode存在，新的vnode不存在的情况，说明是一个 unmount（卸载）的操作
        // 这里只需要将container内dom清空就可以, 目前暂时这样清空
        container.innerHTML = "";
      }
    }
    // 每一次都需要保存上一次的vnode，存储在container下
    container._vnode = vnode; // 暂时使用这段代码清空，后续会完善
  };

  return { render };
}
```

#### patch 简单实现

其中 patch 的函数，是最最重要的一个渲染器的核心，主要是做初始化和相关的 diff 操作

目前进行简单实现，后续着重说

```js
/** 更新对比 */
function patch(n1, n2, container) {
  // 如果不存在
  if (!n1) {
    mountElement(n2, container);
  } else {
    // n1存在的情况下面，我们进行更新（打补丁）
  }
}
```

- n1: 老的 vnode

- n2: 新的 vnode

- container: 容器

如果不存在旧的 vnode 的情况下，说明只是需要进行元素的挂载即可

#### 实现 mountElement 挂载

```js
/** 挂载 */
function mountElement(vnode, container) {
  // 创建dom元素
  const el = document.createElement(vnode.type);
  //处理子节点, 如果子节点是字符串，代表元素具有文本节点
  if (typeof vnode.children === "string") {
    // 只需要设置元素的textContent的属性即可
    el.textContent = vnode.children;
  }
  // 将元素添加到容器中
  container.appendChild(el);
}
```

通过 vnode 的 type 标签名称创建一个新的 dom 元素，接着处理 children，如果是字符串的类型，说明是文本的 child 节点，直接设置 textContent 就可以了，之后 appendChild 插入容器当中

### 配置项形式抽离

因为我们要设计一个相当于是不依赖于平台的一个通用渲染器，所以，需要将上述所用到的所有依赖于浏览器的 api 都给抽离出来，实现独立封装的配置项

例如，我们抽离**mountElement**函数使用到的一些浏览器方法

```js
/** 浏览器端的相关api */
const BROWSER_APIS = {
  // 用于创建元素
  createElement(tag) {
    return document.createElement(tag);
  },

  /** 用于设置元素的文本节点 */
  setElementText(el, text) {
    el.textContent = text;
  },

  /** 给特定的parent下添加指定的元素 */
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
};

export default BROWSER_APIS;
```

之后我们改造**createRenderer**函数

将相关的 api 以 options 的形式传入

```js
/** 创建一个渲染器 */
function createRenderer(options) {
  const { createElement, insert, setElementText } = options;

  /** 挂载 */
  function mountElement(vnode, container) {
    // ...
  }

  /** 更新对比 */
  function patch(n1, n2, container) {
    // ...
  }

  /** 渲染方法 */
  const render = (vnode, container) => {
    // ...
  };

  return { render };
}

export { createRenderer };
```

之后我们就可以通过传递进来的可配置的 apis 去实现相关的渲染器操作

例如，我们可以改造**mountElement**并且使用到相关的 apis

```js
/** 挂载 */
function mountElement(vnode, container) {
  // 创建dom元素
  const el = createElement(vnode.type); // ➕
  //处理子节点, 如果子节点是字符串，代表元素具有文本节点
  if (typeof vnode.children === "string") {
    // 只需要设置元素的textContent的属性即可
    setElementText(e, vnode.children); // ➕
  }
  // 将元素添加到容器中
  insert(el, container); // ➕
}
```

> 通过了以上配置之后，渲染器将不仅仅可以在浏览器端进行使用，我们也可以根据不同的平台，传入不同的自定义的相关 api 参数

# 挂载和更新

## 子节点挂载

上述我们只考虑到了一个 vnode 的 children 为 string 的情况下的挂载，使用 **setElementText** 对元素进行挂载，但是 children 可能存在多个 vnode 非 string 类型的情况

**例如**：以下的 vnode，有两个子节点

```js
const vNode = {
  type: "div",
  children: [
    {
      type: "p",
      children: "111",
    },
    {
      type: "p",
      children: "222",
    },
  ],
};
```

因此需要改造挂载函数，使其具有挂载子节点的能力。这里加入一层 children 节点的判断

```js
/** 挂载函数调用 */
function mountElement(vnode, container) {
  // 创建dom元素
  const el = createElement(vnode.type);
  //处理子节点, 如果子节点是字符串，代表元素具有文本节点
  if (typeof vnode.children === "string") {
    // 只需要设置元素的textContent的属性即可
    setElementText(el, vnode.children);
  } else if (Array.isArray(vnode.children)) {
    // ➕
    // 如果children是数组，则便遍历每一个字节点，然后调用patch的方法
    vnode.children.forEach((child) => {
      patch(null, child, el);
    });
  }
  // 将元素添加到容器中
  insert(el, container);
}
```

## 挂载节点的属性

一个元素可以用多个属性来进行描述，当然映射到虚拟 dom 上的话，用一个 props 的属性进行表示。

```js
const vNode = {
  type: "div",
  props: {
    id: "foo",
  },
  children: [
    {
      type: "p",
      children: "111",
    },
    {
      type: "p",
      children: "222",
    },
  ],
};
```

因此我们在挂载元素的时候，也需要将这些属性值渲染到对应的元素上面

改造挂载函数

```js
/** 挂载函数调用 */
function mountElement(vnode, container) {
  // 创建dom元素
  const el = createElement(vnode.type);
  //处理子节点, 如果子节点是字符串，代表元素具有文本节点
  if (typeof vnode.children === "string") {
    // 只需要设置元素的textContent的属性即可
    setElementText(el, vnode.children);
  } else if (Array.isArray(vnode.children)) {
    // 如果children是数组，则便遍历每一个字节点，然后调用patch的方法
    vnode.children.forEach((child) => {
      patch(null, child, el);
    });
  }

  // 处理props, 存在的情况下进行处理
  if (vnode.props) {
    // ➕
    // 遍历
    for (const key in vnode.props) {
      if (key in el) {
        const prop = vnode.props[key];
        // 调用setAttribute将属性设置到元素上
        el.setAttribute(key, prop); // 🌟
      }
    }
  }

  // 将元素添加到容器中
  insert(el, container);
}
```

在标记“🌟“的地方，也可以使用 `el[key] = vnode.props[key]`，但是由于这都是属于直接操作 dom 对象的行为，所以都会存在缺陷，因此，我们需要想办法如何的正确设置元素的属性

### 🌟HTML attribute 和 DOM properties 区别

HTML attribute 指的就是定义在 HMTL 标签上的属性

```html
<input id="my-input" type="text" value="foo" />
```

document 文档解析之后，会生成一个与之相符的 dom 元素对象，这个对象上面包含了很多的属性

*[Image missing: /Users/leo/Library/Application%20Support/marktext/images/2022-12-05-00-37-36-image.png]*

这些就是所谓的 dom property。

**两者的区分**大致如下

1. 很多的 HTMl attribute 在 DOM 对象上面都有与之同名的 DOM properties，但是命名规则却不一样
   
   **例如**：HTML attribute 的 **class** 对应的 dom property 就是 **className**

2. 两者存在关联：例如上述设置了 HTML attribute 的 id 为‘foo’，那么对应的 DOM properties 当中存在相同属性名称为 id 也为 foo，**两者可以当作直接映射的关系**

3. 并不是都存在直接直接映射关系：例如 value 属性，上述 input 设置了 value 值，但是在 DOM properties 对应的值不仅仅是 value，还有 defaultValue 值；如果后续在 input 框中输入了其他的 value 值 bar
   
   *[Image missing: /Users/leo/Library/Application%20Support/marktext/images/2022-12-05-00-50-37-image.png]*
   
   然后我们再去读取其相关的 HTML Attribute 和 DOM properties 会发现
   
   *[Image missing: /Users/leo/Library/Application%20Support/marktext/images/2022-12-05-00-53-03-image.png]*
   
   其实 HTML Attribute 只是做了一个**初始值的赋值**，但是却是对其他的 DOM property 也有相关影响

4. 非法属性值会被浏览器校验处理掉：例如我们在 **input** 的 HTML attribute 上面设置了一个 **type** 等于一个‘foo‘的属性，那么会被浏览器自动处理掉。最终我们读取 DOM property 的时候，是被矫正之后的值 ‘**text**’

> HTMl Atrribute 的作用就是设置与之对应的 DOM properties 的初始值

所以按照上述的 HTML attribute 和 DOM props 的区别，我们可以改造相关的 mountElement 的操作

```js
/** 挂载函数调用 */
function mountElement(vnode, container) {
  // 创建dom元素
  const el = createElement(vnode.type);
  console.log(el);
  //处理子节点, 如果子节点是字符串，代表元素具有文本节点
  if (typeof vnode.children === "string") {
    // 只需要设置元素的textContent的属性即可
    setElementText(el, vnode.children);
  } else if (Array.isArray(vnode.children)) {
    // 如果children是数组，则便遍历每一个字节点，然后调用patch的方法
    vnode.children.forEach((child) => {
      patch(null, child, el);
    });
  }

  // 处理props, 存在的情况下进行处理
  if (vnode.props) {
    // 遍历
    for (const key in vnode.props) {
      const value = vnode.props[key]; // 获取props对应key的value
      // dom properties存在的情况
      if (key in el) {
        el[key] = value;
      } else {
        // 设置的属性没有对应的DOM properties的情况，调用setAttribute将属性设置到元素上
        el.setAttribute(key, value);
      }
    }
  }

  // 将元素添加到容器中
  insert(el, container);
}
```

### 正确的设置节点的属性

[浏览]()器会自动为我们解析 HTML 文件中的 dom 元素，以及相关的 props 的属性设置操作。

但是在 vue 中，因为用到了自身的模板文件，所以在解析相关的节点的时候需要自身处理这些属性的挂载操作

#### 布尔类型属性处理

例如下面这段 html 代码：

```html
<button disabled />
```

在浏览器中会将其属性 **disabled** 自动矫正为 disabled=true

在目前的我们渲染器中，类似与等价于如下 vnode

```js
const vNode = {
  type: "button",
  props: {
    disabled: "",
  },
};
```

最终在挂载的时候，会调用设置方法将空字符串 设置到 dom 属性上面。

类似于：`el.disabled=''`

但是由于浏览器的自动矫正功能，会将我们的空字符串，自动矫正为 false，这就不符合用户的本意了。

因此我们要对这种 DOM attribute 布尔类型的属性，在赋值的时候加入一层判断

```js
/** 挂载函数调用 */
function mountElement(vnode, container) {
  // 创建dom元素
  // ... 省略代码

  // 处理props, 存在的情况下进行处理
  if (vnode.props) {
    // 遍历
    for (const key in vnode.props) {
      const value = vnode.props[key]; // 获取props对应key的value
      // dom properties存在的情况
      if (key in el) {
        // 获取这个DOM properties元素的属性类型
        const type = typeof el[key]; // ➕
        // 如果原生属性类型为布尔类型，并且value是空的字符串的话，给他值矫正为true
        if (type === "boolean" && value === "") {
          // ➕
          el[key] = true;
        } else {
          // 其他情况
          el[key] = value;
        }
      } else {
        // 设置的属性没有对应的DOM properties的情况，调用setAttribute将属性设置到元素上
        el.setAttribute(key, value);
      }
    }
  }

  // 将元素添加到容器中
  insert(el, container);
}
```

#### 只读类型属性处理

DOM properties 当中还存在很多只读的属性，例如：form

如下例子：

```html
<form id="form1"></form>
<input form="form1" />
```

类似 `form` 这种 DOM properties 在所有的 form 控件上都是，只读的属性的，我们只能通过 `setAttribute`来设置他的属性，所以这时候还得要修改我们的逻辑，判断当前的属性在浏览器中是否是只读的，如果是匹配上这种只读的情况的属性，使用`setAttribute`来进行赋值

```js
// 判断是否应该作为DOM properties的设置
function shouldSetAsProps(el, key, value) {
  // 对特殊只读属性的处理
  if (key === "form" && el.tagName === "INPUT") return false;

  return key in el;
}

/** 挂载函数调用 */
function mountElement(vnode, container) {
  // 创建dom元素
  // ... 省略代码

  // 处理props, 存在的情况下进行处理
  if (vnode.props) {
    // 遍历
    for (const key in vnode.props) {
      const value = vnode.props[key]; // 获取props对应key的value
      // dom properties存在的情况
      if (shouldSetAsProps(el, key, value)) {
        // 获取这个DOM properties元素的属性类型
        const type = typeof el[key];
        // 如果原生属性类型为布尔类型，并且value是空的字符串的话，给他值矫正为true
        if (type === "boolean" && value === "") {
          el[key] = true;
        } else {
          el[key] = value;
        }
      } else {
        // 设置的属性没有对应的DOM properties的情况，调用setAttribute将属性设置到元素上
        el.setAttribute(key, value);
      }
    }
  }

  // 将元素添加到容器中
  insert(el, container);
}
```

#### 提取平台无关代码

我们将遍历 props 时候的 判断设值的代码，提取到 BROWSE_APIS 当中，作为浏览器端的方法，取名为`patchProps`

```js
/** 将属性设置相关的操作封装到patchProps的函数中，并作为渲染器选项传递 */
  patchProps(el, key, preValue, nextValue) {
    // 判断是否应该作为DOM properties的设置
    function shouldSetAsProps(el, key, value) {
      // 对特殊只读属性的处理
      if (key === "form" && el.tagName === "INPUT") return false;
      // ...还有更多特殊处理情况todo

      return Object.hasOwnProperty.call(vnode.props, key);
    }

    // dom properties存在的情况
    if (shouldSetAsProps(el, key, nextValue)) {
      // 获取这个DOM properties元素的属性类型
      const type = typeof el[key];
      // 如果原生属性类型为布尔类型，并且value是空的字符串的话，给他值矫正为true
      if (type === "boolean" && nextValue === "") {
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      // 设置的属性没有对应的DOM properties的情况，调用setAttribute将属性设置到元素上
      el.setAttribute(key, nextValue);
    }
  },
```

最终在 mountElement 中就这样调用

```js
/** 挂载函数调用 */
function mountElement(vnode, container) {
  // 创建dom元素
  const el = createElement(vnode.type);
  console.log(el);
  //处理子节点, 如果子节点是字符串，代表元素具有文本节点
  if (typeof vnode.children === "string") {
    // 只需要设置元素的textContent的属性即可
    setElementText(el, vnode.children);
  } else if (Array.isArray(vnode.children)) {
    // 如果children是数组，则便遍历每一个字节点，然后调用patch的方法
    vnode.children.forEach((child) => {
      patch(null, child, el);
    });
  }

  // 处理props, 存在的情况下进行处理
  if (vnode.props) {
    // 遍历
    for (const key in vnode.props) {
      patchProps(el, key, null, vnode.props[key]); // ➕
    }
  }

  // 将元素添加到容器中
  insert(el, container);
}
```

### class 和 style 的处理

在 vue 中，我们可以用 3 种方式去传递一个 class 的值

字符串

```html
<p class="foo bar"></p>
```

对象

```html
<p :class="{ foo:true,  bar:false }"></p>
```

数组

```html
<p :class="['foo bar', {foo:true,  bar:false }]"></p>
```

无论是何种结构，我们最终转化到 vNode 上面都是要成为一个字符串的

```js
const vNode = {
  type: "p",
  props: {
    class: "foo bar",
  },
};
```

因此在生成 vnode 的过程，我们需要调用 normalizeClass 的方法去转换 class

```js
const vNode = {
  type: "p",
  props: {
    class: normalizeClass([
      "foo",
      {
        foo: false,
        bar: true,
      },
    ]),
  },
};
```

#### 实现 normalizeClass

normalizeClass

```js
/** 格式化class */
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    // 类似数组 join(' ')
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
```

#### 设置 class

设置 dom class 属性的方式有多种，`setAttribute`, `el.className`, `el.classList`

其中`el.className`的性能最好
因此我们改之我们的`patchProps`方法

```js
/** 将属性设置相关的操作封装到patchProps的函数中，并作为渲染器选项传递 */
  patchProps(el, key, preValue, nextValue) {
    // 判断是否应该作为DOM properties的设置
    function shouldSetAsProps(el, key, value) {
      // ...
    }

    if (key === "class") { // ➕
      el.className = nextValue || "";  // ➕
    } else if (shouldSetAsProps(el, key, nextValue)) {
      // ...
    } else {
      // ...
    }
  },
```

当然 style 也是类似的处理方案，只不过在 vue 中调用的是`normalizeStyle`的方法

## 卸载操作

上述说到，我们在 render 函数中使用了 `container.innerHTML = ''`的方式去清空卸载;

```js
/** 渲染方法 */
const render = (vnode, container) => {
  if (vnode) {
    // 新的node存在的情况，将其旧的vnode一起传递给patch函数进行补丁的更新
    patch(container._vnode, vnode, container);
  } else {
    if (container._vnode) {
      // 旧的vnode存在，新的vnode不存在的情况，说明是一个 unmount（卸载）的操作
      // 这里只需要将container内dom清空就可以
      container.innerHTML = ""; // ✨
    }
  }
  // 每一次都需要保存上一次的vnode，存储在container下
  container._vnode = vnode;
};
```

这么做不严谨，原因如下：

1. 容器的内容可能是某个组件或者多个渲染的，在卸载的时候应该去触发组件相关的卸载生命周期函数
2. 自定义指令，没办法正确执行
3. dom 身上绑定的一些事件，不会进行移除

正确的卸载方式：

1. 根据 vnode 对象获取其关联的真实 dom 元素

2. 使用原生的 dom 移除操作将其移除

### 建立 dom 与 vnode 联系

要想根据 vnode 对象获取其关联的真实 dom 元素，首先必须要先建立联系

在挂载阶段我们利用 `createElement`创建了真实的 dom，之后将其绑定在 vnode 上，这样就可以将 vNode 和真实 dom 之间的联系建立起来

```js
/** 挂载函数调用 */
function mountElement(vnode, container) {
  // 创建dom元素
  const el = createElement(vnode.type);
  console.log(el);
  vnode.el = el; // 将其创建出来的dom添加到vnode上，建立联系 ➕
  //处理子节点, 如果子节点是字符串，代表元素具有文本节点
  if (typeof vnode.children === "string") {
    // ...
  } else if (Array.isArray(vnode.children)) {
    // ...
  }

  // 处理props, 存在的情况下进行处理
  if (vnode.props) {
    // ...
  }

  // 将元素添加到容器中
  insert(el, container);
}
```

### 改造 render 函数

```js
/** 渲染方法 */
const render = (vnode, container) => {
  if (vnode) {
    // 新的node存在的情况，将其旧的vnode一起传递给patch函数进行补丁的更新
    patch(container._vnode, vnode, container);
  } else {
    if (container._vnode) {
      // 旧的vnode存在，新的vnode不存在的情况，说明是一个 unmount（卸载）的操作
      // 根据vnode获取要卸载的真实dom元素
      const el = container._vnode.el; // ➕
      // 获取el的父级元素
      const parent = el.parentNode; // ➕
      // 调用removeChild删除元素
      if (parent) parent.removeChild(el); // ➕
    }
  }
  // 每一次都需要保存上一次的vnode，存储在container下
  container._vnode = vnode;
};
```

其中的 container.\_vnode 代表的就是旧的 vnode（即将要被卸载的），由于我们之前绑定上了相关的 dom 在 vnode 上，就可以调用其父级的移除元素的操作

### 封装 unmount

将上述的卸载操作封装成一个 unmount 的函数，方便后续功能增加

unmount

```js
/** 卸载操作 */
function unmount(vnode) {
  // 根据vnode获取要卸载的真实dom元素
  // 获取el的父级元素
  const parent = vnode.el.parentNode;
  if (parent) {
    parent.removeChild(vnode.el);
  }
}
```

render

```js
const render = (vnode, container) => {
  if (vnode) {
    // 新的node存在的情况，将其旧的vnode一起传递给patch函数进行补丁的更新
    patch(container._vnode, vnode, container);
  } else {
    if (container._vnode) {
      // 旧的vnode存在，新的vnode不存在的情况，说明是一个 unmount（卸载）的操作
      unmount(container._vnode); // ➕
    }
  }
  // 每一次都需要保存上一次的vnode，存储在container下
  container._vnode = vnode;
};
```

## 区分 vnode 类型

在 render 函数中，vnode 存在的情况下，会将老的 vnode 和新的 vnode 都传递给 patch 函数去做一个更新，当然是我们的 node 的类型都是相同的情况下，我们才有去做比较的意义。

比如：

```js
const vnode = { type: "p" }; //第一次渲染：
const vnode = { type: "input" }; // 第二次渲染
```

这种情况就没有对比更新的一个必要了。

这种情况下：

1. 先去卸载 p 元素

2. 再将 input 挂载到容器中

因此我们需要改造 patch 的代码

```js
/** 更新对比, 并且做挂载相关的功能 */
function patch(n1, n2, container) {
  // n1老节点存在，对比n1和n2的类型
  if (n1 && n1.type !== n2.type) {
    // ➕
    // 如果新旧vnode的类型不同，则直接将旧的vnode卸载
    unmount(n1); // ➕
    n1 = null; // ➕
  }
  // 如果不存在
  if (!n1) {
    mountElement(n2, container);
  } else {
    // n1存在的情况下面，我们进行更新（打补丁）
  }
}
```

这种情况都是 vnode 为普通标签元素的类型情况下，我们也可以稍微改造一些对组件类型等等的支持

```js
/** 更新对比, 并且做挂载相关的功能 */
function patch(n1, n2, container) {
  // n1老节点存在，对比n1和n2的类型
  if (n1 && n1.type !== n2.type) {
    // 如果新旧vnode的类型不同，则直接将旧的vnode卸载
    unmount(n1);
    n1 = null;
  }

  const { type } = n2;

  if (typeof type === "string") {
    // 说明是普通的标签元素
    if (!n1) {
      // 如果不存在, 就进行挂载
      mountElement(n2, container);
    } else {
      // n1存在的情况下面，我们进行更新（打补丁）
      patchElement(n1, n2);
    }
  } else if (typeof type === "object") {
    // 组件
  } else {
    // 其他
  }
}
```

## 事件处理

首先我们要在 vnode 中去描述事件，假定一个规则，以字符串 on 开头的都视作事件

```js
const vnode = {
  type: "p",
  props: {
    onClick: () => {},
  },
  children: "text",
};
```

### 绑定事件和更新

事件绑定和更新我们就需要在 patchProps 函数中做相关的处理

```js
 /** 将属性设置相关的操作封装到patchProps的函数中，并作为渲染器选项传递 */
  patchProps(el, key, preValue, nextValue) {
    // 匹配事件，以on开头
    if (/^on/.test(key)) { // ➕
      // 根据属性名称得到对应的事件名称
      const name = key.slice(2).toLowerCase(); // ➕
      // 移除上一次绑定的事件处理函数
      prevValue && el.removeEventListener(name, prevValue); // ➕
      // 绑定事件, nextvalue为事件函数
      el.addEventListener(name, nextValue); // ➕
    } else if (key === "class") {
      // ...
    } else if (shouldSetAsProps(el, key, nextValue)) {
       // ...
    } else {
      // ...
    }
  }
```

按如上的逻辑，就是相当于每次更新都要去移除之前绑定的函数，然后再对新的值重新进行监听。但是这么做性能并不是最优的。

我们可以绑定一个伪造的事件处理函数 invoker，然后把真正的事件处理函数设置为 invoker.value，后续更新值的时候，我们只需要更新 invoker.value 值就可以

```js
/** 将属性设置相关的操作封装到patchProps的函数中，并作为渲染器选项传递 */
function patchProps(el, key, prevValue, nextValue) {
  // 匹配事件，以on开头
  if (/^on/.test(key)) {
    // 定义el.vei为一个对象，存在事件名称到事件处理函数的映射
    const invokers = el._vei || (el._vei = {});

    // 获取该元素伪造的事件处理函数, 根据key
    let invoker = invokers[key];
    // 根据属性名称得到对应的事件名称
    const name = key.slice(2).toLowerCase();

    if (nextValue) {
      if (!invoker) {
        // 如果没有invoker，为首次监听，则去伪造一个缓存到el.vei中
        invoker = el._vei[key] = (e) => {
          // 如果invoker是数组的情况，需要遍历执行
          if (Array.isArray(invoker.value)) {
            invoker.value.forEach((fn) => fn(e));
          } else {
            // 这里才是处理真正的事件函数
            invoker.value(e);
          }
        };
        // 赋值事件处理函数到invoker的value上
        invoker.value = nextValue;
        // 绑定invoker
        el.addEventListener(name, invoker);
      } else {
        // 存在invoker说明是更新，只需要更新invoker.value值就行
        invoker.value = nextValue;
      }
    } else if (invoker) {
      // 新的事件函数不存在，需要销毁invoker
      el.removeEventListener(name, invoker);
    }
  } else if (key === "class") {
    // ...
  } else if (shouldSetAsProps(el, key, nextValue)) {
    // ....
  } else {
    // ...
  }
}
```

- invokers：存事件名称与对应函数的映射

- el.\_vei：vue event invoker，在 el 上缓存 invoker

## 更新属性以及子节点

> 更新必定涉及到整个 vnode 上面的属性的变化，包括节点的属性以及节点的子节点的变化

元素的挂载是由 mountElement 触发的

```js
/** 挂载函数调用 */
function mountElement(vnode, container) {
  // 创建dom元素
  const el = createElement(vnode.type);
  console.log(el);
  vnode.el = el; // 将其创建出来的dom添加到vnode上，建立联系
  //处理子节点, 如果子节点是字符串，代表元素具有文本节点
  if (typeof vnode.children === "string") {
    // 只需要设置元素的textContent的属性即可
    setElementText(el, vnode.children);
  } else if (Array.isArray(vnode.children)) {
    // 如果children是数组，则便遍历每一个字节点，然后调用patch的方法
    vnode.children.forEach((child) => {
      patch(null, child, el);
    });
  }

  // 处理props, 存在的情况下进行处理
  if (vnode.props) {
    // 遍历
    for (const key in vnode.props) {
      patchProps(el, key, null, vnode.props[key]);
    }
  }

  // 将元素添加到容器中
  insert(el, container);
}
```

在挂载子节点的时候，首先有两种的类型的区分

- 字符串：具有文本的子节点

- 数组：多个子节点

总的来说，子节点分为 3 种类型：

1. 没有子节点的情况
   
   ```js
   vnode = {
     type: "div",
     children: null,
   };
   ```

2. 字符串的情况
   
   ```js
   vnode = {
     type: "div",
     children: "222",
   };
   ```

3. 数组的情况
   
   ```js
   vnode = {
     type: "div",
     children: ["111", { type: "p" }],
   };
   ```

对应到更新的时候，我们对应的新旧节点都分别是 3 种情况

*[Image missing: 2022-12-09-22-45-02-image.png]*

接下来我们去实现 **patchElement**函数

- n1: 旧 vnode

- n2: 新 vnode

**实现步骤**

1. 首先我们去更新他们的 **props** 的变化，调用之前封装好的 **patchProps** 函数做更新变化

2. 之后去更新他们的 **children**，这里要对以上 **9** 种的情况进行覆盖。

### 实现 props 变化更新

**实现 props 的更新**

1. 从新的 props 参数中找出旧的 props 中与之对应的 key value，调用 pacthProps 方法对 dom 元素进行对比更新

2. 从旧的 props 中找出不存在新 props 中的属性，调用 pacthProps 的方法进行 dom 属性的卸载

```js
/** 更新子节点 */
function pacthElement(n1, n2) {
  n2.el = n1.el;
  const el = n2.el;
  const { props: oldProps } = n1;
  const { props: newProps } = n2;
  // step 1 更新props
  for (const key in newProps) {
    if (newProps[key] !== oldProps[key]) {
      patchProps(el, key, oldProps[key], newProps[key]);
    }
  }
  for (const key in oldProps) {
    if (!(key in newProps)) {
      patchProps(el, key, oldProps[key], null);
    }
  }

  // step 2：更新children
  pacthChildren(n1, n2, el);
}
```

#### 顺手改造 patchProps 函数

我们依据 patchProps 的各个分支，去相对应封装我们的更新方法

最终的改造如下

```js
// 比对props做更新
const patchProp = (el, key, prevValue, nextValue) => {
  if (key === "class") {
    // class的处理
    patchClass(el, nextValue);
  } else if (key === "style") {
    // style的处理
    patchStyle(el, prevValue, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    // 事件的处理
    patchEvent(el, key, nextValue);
  } else {
    // 其他属性的处理
    patchAttr(el, key, nextValue);
  }
};
```

##### 操作 class 更新

```js
/** 比对class属性 */
function patchClass(el, value) {
  // 根据最新值设置类名
  if (value == null) {
    el.removeAttribute("class");
  } else {
    el.className = value;
  }
}
```

##### 操作样式的更新

```js
/** 比对class属性 */
function patchStyle(el, prev, next) {
  // 更新style
  const style = el.style;
  for (const key in next) {
    // 用最新的直接覆盖
    style[key] = next[key];
  }
  if (prev) {
    for (const key in prev) {
      // 老的有新的没有删除
      if (next[key] == null) {
        style[key] = null;
      }
    }
  }
}
```

##### 操作事件的更新

```js
/** 创建一个invoker */
function createInvoker(initialValue) {
  const invoker = (e) => invoker.value(e);
  invoker.value = initialValue;
  return invoker;
}
/** 比对事件更新 */
function patchEvent(el, rawName, nextValue) {
  // 更新事件
  const invokers = el._vei || (el._vei = {});
  const exisitingInvoker = invokers[rawName]; // 是否缓存过

  if (nextValue && exisitingInvoker) {
    exisitingInvoker.value = nextValue;
  } else {
    const name = rawName.slice(2).toLowerCase(); // 转化事件是小写的
    if (nextValue) {
      // 缓存函数
      const invoker = (invokers[rawName] = createInvoker(nextValue));
      el.addEventListener(name, invoker);
    } else if (exisitingInvoker) {
      el.removeEventListener(name, exisitingInvoker);
      invokers[rawName] = undefined;
    }
  }
}
```

##### 操作属性的更新

```js
/** 比对dom properties或者是html attributes */
function patchAttr(el, key, value) {
    // 更新属性
    if (value == null) {
      // 如果值不存在，说明是卸载props的操作
      el.removeAttribute(key);
    } else {
      if (shouldSetAsProps(el, key, nextValue)) {
        // dom properties存在的情况
        // 获取这个DOM properties元素的属性类型
        const type = typeof el[key];
        // 如果原生属性类型为布尔类型，并且value是空的字符串的话，给他值矫正为true
        if (type === "boolean" && nextValue === "") {
          el[key] = true;
        } else {
          el[key] = nextValue;
        }
      } else {
        el.setAttribute(key, value);
      }
    }
  }
```

### 更新 children 节点

对照以上 3\*3 的节点情况

#### 1. 新子节点是文本节点

```js
/** 更新children */
function pacthChildren(n1, n2, container) {
  // 判断新子节点的类型是否是文本节点
  if (typeof n2.children === "string") {
    // 当新节点为文本节点的时候，如果旧节点是一组子的节点，我们需要逐个去卸载，其他情况啥也不做
    if (Array.isArray(n1.children)) {
      n1.children.forEach((node) => unmount(node));
    }
    // 最后设置新的节点内容
    setElementText(container, n2.children);
  }
}
```

#### 2. 新子节点是一组

```js
/** 更新children */
function pacthChildren(n1, n2, container) {
  // 判断新子节点的类型是否是文本节点
  if (typeof n2.children === "string") {
    // ...
  } else if (Array.isArray(n2.children)) {
    // 当新的子节点是一组
    // 我们判断旧的子节点是否也是一组
    if (Array.isArray(n1.children)) {
      // diff算法 todo
    } else {
      // 到这里，存在两种情况，要么是文本节点要么无
      // 什么情况下都去清空，然后将一组新的子节点添加进来
      setElementText(container, "");
      n2.children.forEach((node) => patch(null, node, container));
    }
  }
}
```

diff 算法，目前先用傻瓜逻辑实现，全部卸载然后再全部挂载

```js
n1.children.forEach((node) => unmount(node));
n2.children.forEach((node) => patch(null, node, container));
```

#### 3. 新子节点啥也没有

```js
/** 更新children */
function pacthChildren(n1, n2, container) {
  // 判断新子节点的类型是否是文本节点
  if (typeof n2.children === "string") {
    // 当新节点为文本节点的时候，如果旧节点是一组子的节点，我们需要逐个去卸载，其他情况啥也不做
    if (Array.isArray(n1.children)) {
      n1.children.forEach((node) => unmount(node));
    }
    // 最后设置新的节点内容
    setElementText(container, n2.children);
  } else if (Array.isArray(n2.children)) {
    // ....
  } else {
    // 到这里，说明新的子节点不存在
    // 如果旧的节点是一组子节点，只需要逐个卸载就可以
    if (Array.isArray(n1.children)) {
      n1.children.forEach((node) => unmount(node));
    } else if (typeof n1.children === "string") {
      // 旧节点是文本，清空
      setElementText(container, "");
    }
    // 其他情况不用管
  }
}
```

## 特殊节点类型

一般我们用 vnode 描述节点，都是用 type 去描述节点类型

但是 像 文本节点 注释节点 以及 vue3 的 fragment，都较为特殊

```html
<Fragment>
  <!-- 注释节点 -->
  文本节点
</Fragment>
```

### 文本节点和注释节点处理

这两者对于普通标签节点来说，不具备标签名称，所以需要框架认为的去创造一些唯一的标识，并且将其作为注释节点和文本节点的 type

描述文本和注释节点：

```js
// 加入人为的文本节点标识
const Text = Symbol();
const newVnode = {
  type: Text,
  children: "文本节点",
};
// 加入人为的注释节点标识
const Comment = Symbol();
const newVnode = {
  type: Comment,
  children: "注释的节点",
};
```

加入两者之后，我们需要在 patch 中去做相关的改造

```js
/** 更新对比, 并且做挂载相关的功能 */
  function patch(n1, n2, container) {
    // n1老节点存在，对比n1和n2的类型
    if (n1 && n1.type !== n2.type) {
      // 如果新旧vnode的类型不同，则直接将旧的vnode卸载
      unmount(n1);
      n1 = null;
    }

    const { type } = n2;

    if (typeof type === "string") {
      // ....
    } else if (typeof type === "object") {
      // 组件
    } else if (type === Text) {
      // 文本标签
      if (!n1) {
        // 使用原生createTextNode去创建文本节点
        const el = (n2.el = document.createTextNode(n2.children));
        // 将文本节点插入到容器中
        insert(el, container);
      } else {
        // 如果旧的vnode存在，只需要使用心得文本节点的文本内容更新旧文本节点就可以了
        const el = (n2.el = n1.el);
        if (n2.children !== n1.children) {
          el.nodeValue = n2.children;
        }
      }
    }
```

当然上述用到了相关浏览器的 api 我们需要给他提取出来`document.createTextNode`以及`el.nodeValue`

```js
/** 浏览器端的相关api */
const BROWSER_APIS = {
  // 用于创建元素
  createElement(tag) {
    // ...
  },

  /** 用于设置元素的文本节点 */
  setElementText(el, text) {
    // ...
  },

  /** 给特定的parent下添加指定的元素 */
  insert(el, parent, anchor = null) {
    // ...
  },

  /** 创建文本节点 */
  createText(text) {
    // ➕
    return document.createTextNode(text);
  },

  /** 设置文本值 */
  setText(el, text) {
    // ➕
    el.nodeValue = text;
  },

  /** 将属性设置相关的操作封装到patchProps的函数中，并作为渲染器选项传递 */
  patchProps(el, key, prevValue, nextValue) {
    // ...
  },
};
```

处理注释的节点和其类似，调用原生的 `document.createComment`函数来创建即可

### Fragment

Fragment 和 tex 以及注释类似，type 也需要人为加入标识

```js
const Fragment = Symbol();
```

在项目中经常会有类似这样的 vNode，

```js
const vNode = {
  type: "ul",
  children: [
    {
      type: Fragment,
      children: [
        {
          type: "li",
          children: "1",
        },
        {
          type: "li",
          children: "2",
        },
      ],
    },
  ],
};
```

由于 Fragment 本身是不属于一个真正的节点的，所以在做渲染的时候，我们只需要渲染它的子节点就可以了

因此我们改造 patch 函数

```js
/** 更新对比, 并且做挂载相关的功能 */
function patch(n1, n2, container) {
  // n1老节点存在，对比n1和n2的类型
  if (n1 && n1.type !== n2.type) {
    // 如果新旧vnode的类型不同，则直接将旧的vnode卸载
    unmount(n1);
    n1 = null;
  }

  const { type } = n2;

  if (typeof type === "string") {
    // ...
  } else if (typeof type === "object") {
    // 组件
  } else if (type === Text) {
    // ...
  } else if (type === Fragment) {
    // 如果是 片段节点
    if (!n1) {
      // 如果不存在旧节点的话，只需要将Fragment的children逐个挂载就可以
      n2.children.forEach((node) => patch(null, node, container));
    } else {
      // 如果旧的vnode存在的话， 则只需要更新fragment的children就可以
      pacthChildren(n1, n2, container);
    }
  }
}
```

并且对于我们在卸载的时候，也要做相关的处理

```js
/** 卸载操作 */
function unmount(vnode) {
  // 在卸载的时候，如果是卸载的vnode类型为Fragment， 则需要卸载他的children
  if (vnode.type === Fragment) {
    vnode.children.forEach((node) => unmount(node));
    return;
  }
  // 根据vnode获取要卸载的真实dom元素
  // 获取el的父级元素
  const parent = vnode.el.parentNode;
  if (parent) {
    parent.removeChild(vnode.el);
  }
}
```

> 后面再说 diff

## diff 算法

// todo....

### 简单的 diff 算法

### 双端 diff 算法

### 快速 diff 算法
