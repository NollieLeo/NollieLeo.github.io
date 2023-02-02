---
title: diff算法原理和总结
date: 2023-01-28 13:45:24
tags:
  - diff
  - Vue
  - React
categories:
  - Vue
---

> 这里举例采用 vue 的框架设计进行解释 diff

> diff 算法的核心其实是都是只关心新旧的虚拟节点都存在一组子节点的情况。目的都是达到减少性能的开销，其中有比较直观的就是--**减少 dom 节点的操作**

在[Vue3 渲染器设计与总结](https://nollieleo.github.io/2022/12/03/vue3%E6%B8%B2%E6%9F%93%E5%99%A8%E8%AE%BE%E8%AE%A1%E4%B8%8E%E6%80%BB%E7%BB%93/#2-%E6%96%B0%E5%AD%90%E8%8A%82%E7%82%B9%E6%98%AF%E4%B8%80%E7%BB%84)中 当涉及到两组子节点的更新的时候，我们采用的是全量卸载并且重新挂载的形式去进行子节点的更新的，这样是非常不合理。

如果只从 “挂载”和“卸载”的两个简单角度出发，我们可以很容易实现一个减少 dom 开销的更新逻辑，如下几图所示

**情况一**：数量相同的情况

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-29-00-17-49-image.png" title="" alt="" width="495">

**情况二**：旧节点多于新节点

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-29-00-19-24-image.png" title="" alt="" width="499">

**情况三**：旧节点少于新节点

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-29-00-20-45-image.png" title="" alt="" width="499">

综上：数量相同的节点我们先进行 patch 从而进行更新操作，卸载和挂载从剩余的节点出发做处理。

因此我们可以改造 patchChildren 的函数简单实现这套逻辑

```js
/** 更新children */
function pacthChildren(n1, n2, container) {
  // 判断新子节点的类型是否是文本节点
  if (typeof n2.children === "string") {
    // ...
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children;
    const newChildren = n2.children;
    /** 旧节点长度 */
    const oldL = oldChildren.length;
    /** 新节点长度 */
    const newL = newChildren.length;
    // 比较两者长度，取最短的，然后进行pacth操作
    const minL = Math.min(oldL, newL);
    // 遍历，目的就是为了达到减少dom的操作
    for (let i = 0; i < minL; i++) {
      patch(oldChildren[i], newChildren[i]);
    }
    // 如果有新增节点，及newL > oldL, 说明有节点要进行挂载
    if (newL > oldL) {
      for (let i = minL; i < newL; i++) {
        patch(null, newChildren[i], container);
      }
    } else if (oldL > newL) {
      for (let i = minL; i < oldL; i++) {
        unmount(oldChildren[i]);
      }
    }
  } else {
    // ...
  }
}
```

但是这种方式仍然不是最优的解法，当我们考虑以下这种情况。

```json
// 旧节点：
[
    {type:'p'},
    {type:'span'},
    {type:'div'}
]
// 新节点
[

    {type:'div'},
    {type:'p'},
    {type:'span'},
]
```

他们只是简单的进行了位置的移动，却要进行 3 次的卸载和 3 次的挂载 dom 的操作。因此我们可以从 dom 的**复用角度**出发，从而引出 diff 算法实现更优解

## 简单 diff 算法

要想知道前后的节点进行了移动从而去复用，必须要有标识，在 react 和 vue 中都是采用 key 的形式去给虚拟 dom 做标识的；

```json
[
  {
    "type": "p",
    "key": "123",
    "children": "123"
  },
  {
    "type": "span",
    "key": "234",
    "children": "234"
  },
  {
    "type": "div",
    "key": "345",
    "children": "345"
  }
]
```

### 打补丁

在我们有了标识了就可以知道前后节点对应的位置，但是 key 值的前后不变，不代表节点不需要更新，因为前后的 children 或者相关的属性也会发生变化，如下

```javascript
/** 旧 */
const oldVNode = {
  type: "div",
  children: [
    { type: "p", children: "1", key: "1" },
    { type: "p", children: "2", key: "2" },
    { type: "p", children: "weng", key: "3" },
  ],
};
/** 新 */
const newVNode = {
  type: "div",
  children: [
    { type: "p", children: "kaimin", key: "3" },
    { type: "p", children: "1", key: "1" },
    { type: "p", children: "2", key: "2" },
  ],
};
```

因此我们从新的节点中找到对应 key 值的旧节点从而先进行打补丁的一个操作

```js
/** 更新children */
function pacthChildren(n1, n2, container) {
  // 判断新子节点的类型是否是文本节点
  if (typeof n2.children === "string") {
    // ...
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children;
    const newChildren = n2.children;

    // 遍历新children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = array[i];
      for (let j = 0; j < oldChildren.length; j++) {
        const oldVNode = array[j];
        // 如果找到了前后想等key的vnode，那么先进行打补丁操作
        if (newVNode.key === oldVNode.key) {
          patch(oldVNode, newVNode, container);
          break; // 找到了直接退出循环
        }
      }
    }
  } else {
    // ...
  }
}
```

打完补丁之后，前后节点的顺序仍然是不同的，所以我们要进行移动可复用节点

### 找到可移动的元素

判断一个节点是否需要移动，则就是判断更新前后的节点**顺序**有无发生变化

前后节点的 key 值没有发生变化，对应的索引更新后也是 0，1，2 和旧 children 的索引保持一个一个递增的状态，因此这种情况是不需要节点移动的

`p-[key]`

<img title="" src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-29-10-37-47-image.png" alt="" width="394">

如果节点前后顺序改变了

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-29-10-43-49-image.png" title="" alt="" width="402">

更新后，节点的索引为，2，0，1，因此我们可以得出，此次更新打破了原有的索引递增规则，原始节点索引为 0 和 1 的节点需要进行移动，且真实的 dom 元素需要移动到 p-3 dom 节点的后头

其实可以将 p-3 在旧 children 中对应的索引定义为：**在旧 children 中寻找相同 key 值节点的过程中，遇到的最大索引值**，如果后续在寻找过程中发现节点索引值比这个还要小，说明需要进行移动

因此我们改动代码，用一个 “遇到的最大索引” -- `lastIndex`来做标记

```js
/** 更新children */
function pacthChildren(n1, n2, container) {
  // 判断新子节点的类型是否是文本节点
  if (typeof n2.children === "string") {
    // ...
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children;
    const newChildren = n2.children;

    /** 寻找旧数组相同key值节点的过程中，遇到的最大索引 */
    let lastIndex = 0; // ➕

    // 遍历新children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = array[i];
      for (let j = 0; j < oldChildren.length; j++) {
        const oldVNode = array[j];
        // 如果找到了前后想等key的vnode，那么先进行打补丁操作
        if (newVNode.key === oldVNode.key) {
          patch(oldVNode, newVNode, container);
          if (j < lastIndex) {
            // ➕
            // 说明需要移动节点了
          } else {
            // 表明j比lastIndex还大，需要更新
            lastIndex = j; // ➕
          }
          break; // 找到了直接退出循环
        }
      }
    }
  } else {
    // ...
  }
}
```

现在就找到了需要移动的节点，只要这个节点的旧节点的索引，小于 lastIndex，则就需要移动，接下来说如何移动他

### 移动节点

如上的例子，移动完 p-1 之后 vNode 和真实 dom 的对应关系，我们知道新 children 的顺序其实就是更新后的真实 dom 的顺序，所以这里我们把 p-1 移动到 p-3 对应的真实 dom 后面，p-2 同理，p-3 在这个过程是保持不动的。所以我们根据这种情况对 dom 顺序进行操作

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-29-11-09-30-image.png" title="" alt="" width="456">

因此我们加入移动真实 dom 的代码

```js
/** 更新children */
function pacthChildren(n1, n2, container) {
  // 判断新子节点的类型是否是文本节点
  if (typeof n2.children === "string") {
    // ...
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children;
    const newChildren = n2.children;

    /** 寻找旧数组相同key值节点的过程中，遇到的最大索引 */
    let lastIndex = 0;

    // 遍历新children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = array[i];
      for (let j = 0; j < oldChildren.length; j++) {
        const oldVNode = array[j];
        // 如果找到了前后想等key的vnode，那么先进行打补丁操作
        if (newVNode.key === oldVNode.key) {
          patch(oldVNode, newVNode, container);
          if (j < lastIndex) {
            // 说明需要移动节点了
            /** 先获取newVNode的前一个Vnode */
            const prevVnode = newChildren[i - 1];
            // 如果prevVnode不存在，则说明当前newVNode是第一个节点，他不需要进行移动
            if (prevVnode) {
              // 由于需要将newVNode所对应的真实DOM移到prevVnode所对应的真实DOM的后面
              // 所以需要获取prevVNode所对应的真实DOM的下一个兄弟节点，将其作为锚点
              const anchor = prevVnode.el.nextSibling;
              // 调用inser方法将其插入到anchor锚点的前面，也就是prevVNode对应真实DOM的后面
              insert(newVNode.el, container, anchor);
            }
          } else {
            // 表明j比lastIndex还大，需要更新
            lastIndex = j;
          }
          break; // 找到了直接退出循环
        }
      }
    }
  } else {
    // ...
  }
}
```

### 添加新节点

以上说的都是前后节点数量相同的情况，现在说新节点数大于旧节点数的情况；

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-29-16-24-46-image.png" title="" alt="" width="466">

出发点就是：

1. 找到需要添加的新节点

2. 想办法弄进去

#### 找到需要添加的节点

找到需要添加的节点，这层好理解，也就是我们在外层（newChildren）遍历去找内层的（oldChildren）key 相同节点的这个过程中，没有找见，说明这个节点就是一个新增的节点。

在内层遍历的时候，这里采用一个`find`的字段去表示是否找到了节点是 key 相同的。

```js
/** 更新children */
function pacthChildren(n1, n2, container) {
  // 判断新子节点的类型是否是文本节点
  if (typeof n2.children === "string") {
    // ...
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children;
    const newChildren = n2.children;

    /** 寻找旧数组相同key值节点的过程中，遇到的最大索引 */
    let lastIndex = 0;
    /** 表明是否在oldChildren中找到了可复用节点 */
    let find = false; // ➕

    // 遍历新children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = array[i];
      for (let j = 0; j < oldChildren.length; j++) {
        const oldVNode = array[j];
        // 如果找到了前后想等key的vnode，那么先进行打补丁操作
        if (newVNode.key === oldVNode.key) {
          // 找到了复用的节点，设置为true
          find = true; // ➕
          patch(oldVNode, newVNode, container);
          if (j < lastIndex) {
            // 说明需要移动节点了
            /** 先获取newVNode的前一个Vnode */
            const prevVnode = newChildren[i - 1];
            // 如果prevVnode不存在，则说明当前newVNode是第一个节点，他不需要进行移动
            if (prevVnode) {
              // 由于需要将newVNode所对应的真实DOM移到prevVnode所对应的真实DOM的后面，所以需要获取prevVNode所对应的真实DOM的下一个兄弟节点，将其作为锚点
              const anchor = prevVnode.el.nextSibling;
              // 调用inser方法将其插入到anchor锚点的前面，也就是prevVNode对应真实DOM的后面
              insert(newVNode.el, container, anchor);
            }
          } else {
            // 表明j比lastIndex还大，需要更新
            lastIndex = j;
          }
          break; // 找到了直接退出循环
        }
      }
    }
  } else {
    // ...
  }
}
```

#### 正确添加节点

通过 find 字段，我们可以增加逻辑，当没有找到相关的复用节点的时候，就可以执行插入：

1. 插入的节点必须插入在 newVNode 的前一个节点的后头，因此需要找到前面一个节点锚点

2. 如果没有前一个节点的情况，那说明，这个 newVNode 所对应的 DOM 是整个 dom 树的第一个节点

因此改造逻辑

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
    const oldChildren = n1.children;
    const newChildren = n2.children;

    /** 寻找旧数组相同key值节点的过程中，遇到的最大索引 */
    let lastIndex = 0;
    /** 表明是否在oldChildren中找到了可复用节点 */
    let find = false;

    // 遍历新children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = array[i];
      for (let j = 0; j < oldChildren.length; j++) {
        const oldVNode = array[j];
        // 如果找到了前后想等key的vnode，那么先进行打补丁操作
        if (newVNode.key === oldVNode.key) {
          // 找到了复用的节点，设置为true
          find = true;
          patch(oldVNode, newVNode, container);
          if (j < lastIndex) {
            // 说明需要移动节点了
            /** 先获取newVNode的前一个Vnode */
            const prevVnode = newChildren[i - 1];
            // 如果prevVnode不存在，则说明当前newVNode是第一个节点，他不需要进行移动
            if (prevVnode) {
              // 由于需要将newVNode所对应的真实DOM移到prevVnode所对应的真实DOM的后面，所以需要获取prevVNode所对应的真实DOM的下一个兄弟节点，将其作为锚点
              const anchor = prevVnode.el.nextSibling;
              // 调用inser方法将其插入到anchor锚点的前面，也就是prevVNode对应真实DOM的后面
              insert(newVNode.el, container, anchor);
            }
          } else {
            // 表明j比lastIndex还大，需要更新
            lastIndex = j;
          }
          break; // 找到了直接退出循环
        }
      }

      // 如果走到这里find仍然为false，说明这个newNode是新节点，oldChildren中没找到可复用的节点
      if (!find) {
        /** 先获取newVNode的前一个Vnode */
        const prevVnode = newChildren[i - 1];
        /** 锚点 */
        let anchor = null;
        if (prevVnode) {
          // 如果有前一个vnode节点，那么就赋值给他的下一个兄弟节点
          anchor = prevVnode.el.nextSibling;
        } else {
          // 说没有前一个节点，那么当前的节点就是整个容器的第一个节点
          anchor = container.firstChild;
        }
        // 执行新节点的挂载操作
        patch(null, newVNode, container, anchor);
      }
    }
  } else {
    // ...
  }
}
```

### 移除节点

如下讨论节点被删除的情况

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-29-20-00-16-image.png" title="" alt="" width="501">

如图 p-2 节点在更新之后被删除了，按照原有新节点遍历遍历之后，我们会发现，旧的数组中还有残余，因此还需要增加处理老节点中被删除的节点处理逻辑

对于老节点，我们增加如下逻辑：

1. 遍历老节点，从中找到新节点中不存在的节点

2. 卸载老节点

```js
/** 更新children */
function pacthChildren(n1, n2, container) {
  // 判断新子节点的类型是否是文本节点
  if (typeof n2.children === "string") {
    //...
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children;
    const newChildren = n2.children;

    /** 寻找旧数组相同key值节点的过程中，遇到的最大索引 */
    let lastIndex = 0;
    /** 表明是否在oldChildren中找到了可复用节点 */
    let find = false;

    // 遍历新children
    for (let i = 0; i < newChildren.length; i++) {
      // ...
    }

    // 遍历老children
    for (let i = 0; i < oldChildren.length; i++) {
      const oldVNode = oldChildren[i];
      // 拿旧子节点oldVNode去新的一组中寻找相同key值的节点
      const has = newChildren.find((vnode) => vnode.key === oldVNode.key);
      // 如果发现新节点中不存在，择要删掉
      if (!has) {
        unmount(oldVNode);
      }
    }
  } else {
    //...
  }
}
```

简单 diff 算法就到这里。

## 双端 diff 算法

> 双端 diff 算法指的就是 - 同时对**新旧两组子节点**的**两个端点**进行比较的算法

相较于简单 diff 算法，双端 diff 有个优势，通过 4 个指针去进行节点比较找到可复用的节点，比如涉及到简单 diff 中的一个例子

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-29-10-43-49-image.png" title="" alt="" width="402">

简单 diff 要进行 2 次的 dom 节点的位置改变

而双端 diff 在这种情况下只需要 1 次 dom 操作（迁移 p-3 节点到 p-1 的前面）

### 四个端点的表示

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-30-09-47-11-image.png" title="" alt="" width="552">

以下使用代码表示：

```js
/** 双端diff算法 */
function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;
  // 四个索引
  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;
  // 四个索引对应的vNode
  let oldStartVNode = oldChildren[oldStartIdx];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[newStartIdx];
  let newEndVNode = newChildren[newEndIdx];
}
```

### 比较方式

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-30-10-32-38-image.png" title="" alt="" width="536">

1. 主要分为 4 个步骤，按照如图 1，2，3，4 的步骤进行比较
   
   ```js
   /** 双端diff算法 */
   function patchKeyedChildren(n1, n2, container) {
     const oldChildren = n1.children;
     const newChildren = n2.children;
     // 四个索引
     let oldStartIdx = 0;
     let oldEndIdx = oldChildren.length - 1;
     let newStartIdx = 0;
     let newEndIdx = newChildren.length - 1;
     // 四个索引对应的vNode
     let oldStartVNode = oldChildren[oldStartIdx];
     let oldEndVNode = oldChildren[oldEndIdx];
     let newStartVNode = newChildren[newStartIdx];
     let newEndVNode = newChildren[newEndIdx];
   
     if (oldStartVNode.key === newStartVNode.key) {
       // 第一步：比较oldStartVNode 和newStartVNode
     } else if (oldEndVNode.key === newEndVNode.key) {
       // 第二步：比较oldEndVNode 和 newEndVNode
     } else if (oldStartVNode.key === newEndVNode.key) {
       // 第三步：比较oldStartVNode和 newEndVNode
     } else if (oldEndVNode.key === newStartVNode.key) {
       // 第四步：比较oldEndVNode和 newStartVNode
     }
   }
   ```

2. 假如 在步骤 1 或者 2 中找到对应复用的节点，说明他们的位置相对而言没有改变，所以不需要进行移动，这时候只需要进行节点的打补丁操作即可，之后将对应的索引同时上移或者是下移。
   
   ```js
   /** 双端diff算法 */
   function patchKeyedChildren(n1, n2, container) {
     const oldChildren = n1.children;
     const newChildren = n2.children;
     // 四个索引
     let oldStartIdx = 0;
     let oldEndIdx = oldChildren.length - 1;
     let newStartIdx = 0;
     let newEndIdx = newChildren.length - 1;
     // 四个索引对应的vNode
     let oldStartVNode = oldChildren[oldStartIdx];
     let oldEndVNode = oldChildren[oldEndIdx];
     let newStartVNode = newChildren[newStartIdx];
     let newEndVNode = newChildren[newEndIdx];
   
     if (oldStartVNode.key === newStartVNode.key) {
       // 第一步：比较oldStartVNode 和newStartVNode
       // 打补丁
       patch(oldStartVNode, newStartVNode, container);
       // 更新索引
       oldStartVNode = oldChildren[++oldStartIdx];
       newStartVNode = newChildren[++newStartIdx];
     } else if (oldEndVNode.key === newEndVNode.key) {
       // 第二步：比较oldEndVNode 和 newEndVNode
       // 打补丁
       patch(oldEndVNode, newEndVNode, container);
       // 更新索引
       oldEndVNode = oldChildren[--oldEndIdx];
       newEndVNode = newChildren[--newEndIdx];
     } else if (oldStartVNode.key === newEndVNode.key) {
       // 第三步：比较oldStartVNode和 newEndVNode
     } else if (oldEndVNode.key === newStartVNode.key) {
       // 第四步：比较oldEndVNode和 newStartVNode
     }
   }
   ```

3. 假如是步骤 4 命中，说明原本在 oldChildren 中是最后一个节点，但是在新顺序中，变成了第一个节点，对应到代码中的逻辑就是：**将索引 oldEndIdx 指向的真实 dom 节点，移动到索引 oldStartIdx 指向的虚拟节点所对应的真实 dom 前面**，同时更新索引
   
   ```js
   /** 双端diff算法 */
   function patchKeyedChildren(n1, n2, container) {
     const oldChildren = n1.children;
     const newChildren = n2.children;
     // 四个索引
     let oldStartIdx = 0;
     let oldEndIdx = oldChildren.length - 1;
     let newStartIdx = 0;
     let newEndIdx = newChildren.length - 1;
     // 四个索引对应的vNode
     let oldStartVNode = oldChildren[oldStartIdx];
     let oldEndVNode = oldChildren[oldEndIdx];
     let newStartVNode = newChildren[newStartIdx];
     let newEndVNode = newChildren[newEndIdx];
   
     if (oldStartVNode.key === newStartVNode.key) {
       // 第一步：比较oldStartVNode 和newStartVNode
       // 打补丁
       patch(oldStartVNode, newStartVNode, container);
       // 更新索引
       oldStartVNode = oldChildren[++oldStartIdx];
       newStartVNode = newChildren[++newStartIdx];
     } else if (oldEndVNode.key === newEndVNode.key) {
       // 第二步：比较oldEndVNode 和 newEndVNode
       // 打补丁
       patch(oldEndVNode, newEndVNode, container);
       // 更新索引和头尾部节点变量
       oldEndVNode = oldChildren[--oldEndIdx];
       newEndVNode = newChildren[--newEndIdx];
     } else if (oldStartVNode.key === newEndVNode.key) {
       // 第三步：比较oldStartVNode和 newEndVNode
     } else if (oldEndVNode.key === newStartVNode.key) {
       // 第四步：比较oldEndVNode和 newStartVNode
       // 打补丁
       patch(oldEndVNode, newStartVNode, container);
       // 移动dom
       insert(oldEndVNode.el, container, newStartVNode.el);
       // 移动完dom之后，更新索引
       oldEndVNode = oldChildren[--oldEndIdx];
       newStartVNode = newChildren[++newStartIdx];
     }
   }
   ```

4. 假如是步骤 3 命中，说明原本在 oldChildren 中是第一个节点，但是在新顺序中，变成了最后一个节点，对应到代码中的逻辑是：**将索引 oldStartIdx 指向的真实 dom 节点，移动到索引 oldEndIdx 指向的虚拟节点对应的真实 dom 的后面**，同时更新索引
   
   ```js
   /** 双端diff算法 */
   function patchKeyedChildren(n1, n2, container) {
     const oldChildren = n1.children;
     const newChildren = n2.children;
     // 四个索引
     let oldStartIdx = 0;
     let oldEndIdx = oldChildren.length - 1;
     let newStartIdx = 0;
     let newEndIdx = newChildren.length - 1;
     // 四个索引对应的vNode
     let oldStartVNode = oldChildren[oldStartIdx];
     let oldEndVNode = oldChildren[oldEndIdx];
     let newStartVNode = newChildren[newStartIdx];
     let newEndVNode = newChildren[newEndIdx];
   
     if (oldStartVNode.key === newStartVNode.key) {
       // 第一步：比较oldStartVNode 和newStartVNode
       // 打补丁
       patch(oldStartVNode, newStartVNode, container);
       // 更新索引
       oldStartVNode = oldChildren[++oldStartIdx];
       newStartVNode = newChildren[++newStartIdx];
     } else if (oldEndVNode.key === newEndVNode.key) {
       // 第二步：比较oldEndVNode 和 newEndVNode
       // 打补丁
       patch(oldEndVNode, newEndVNode, container);
       // 更新索引和头尾部节点变量
       oldEndVNode = oldChildren[--oldEndIdx];
       newEndVNode = newChildren[--newEndIdx];
     } else if (oldStartVNode.key === newEndVNode.key) {
       // 第三步：比较oldStartVNode和 newEndVNode
       // 打补丁
       patch(oldStartVNode, newEndVNode, container);
       insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling);
       // 更新下一个索引
       oldStartVNode = oldChildren[++oldStartIdx];
       newEndVNode = newChildren[--newEndIdx];
     } else if (oldEndVNode.key === newStartVNode.key) {
       // 第四步：比较oldEndVNode和 newStartVNode
       // 打补丁
       patch(oldEndVNode, newStartVNode, container);
       // 移动dom
       insert(oldEndVNode.el, container, newStartVNode.el);
       // 移动完dom之后，更新索引
       oldEndVNode = oldChildren[--oldEndIdx];
       newStartVNode = newChildren[++newStartIdx];
     }
   }
   ```

再将更新的逻辑封装到一个 while 循环中，由于每一轮的循环，都会更新相对应的索引值，所以循环的条件：**头部的索引值要小于等于尾部索引值**

```js
/** 双端diff算法 */
function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;
  // 四个索引
  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;
  // 四个索引对应的vNode
  let oldStartVNode = oldChildren[oldStartIdx];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[newStartIdx];
  let newEndVNode = newChildren[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVNode.key === newStartVNode.key) {
      // 第一步：比较oldStartVNode 和newStartVNode
      // 打补丁
      patch(oldStartVNode, newStartVNode, container);
      // 更新索引
      oldStartVNode = oldChildren[++oldStartIdx];
      newStartVNode = newChildren[++newStartIdx];
    } else if (oldEndVNode.key === newEndVNode.key) {
      // 第二步：比较oldEndVNode 和 newEndVNode
      // 打补丁
      patch(oldEndVNode, newEndVNode, container);
      // 更新索引和头尾部节点变量
      oldEndVNode = oldChildren[--oldEndIdx];
      newEndVNode = newChildren[--newEndIdx];
    } else if (oldStartVNode.key === newEndVNode.key) {
      // 第三步：比较oldStartVNode和 newEndVNode
      // 打补丁
      patch(oldStartVNode, newEndVNode, container);
      insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling);
      // 更新下一个索引
      oldStartVNode = oldChildren[++oldStartIdx];
      newEndVNode = newChildren[--newEndIdx];
    } else if (oldEndVNode.key === newStartVNode.key) {
      // 第四步：比较oldEndVNode和 newStartVNode
      // 打补丁
      patch(oldEndVNode, newStartVNode, container);
      // 移动dom
      insert(oldEndVNode.el, container, newStartVNode.el);
      // 移动完dom之后，更新索引
      oldEndVNode = oldChildren[--oldEndIdx];
      newStartVNode = newChildren[++newStartIdx];
    }
  }
}
```

### 双端 diff 的优势

比如简单 diff 中的所说的一个例子

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-30-21-14-52-image.png" title="" alt="" width="484">

在简单的 diff 算法中，我们需要将 p-1 和 p-2 的节点移动到 p-3 的节点后面，进行两次的 dom 移动操作。

双端 diff 针对这种情况流程如下：

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-30-21-25-43-image.png" title="" alt="" width="592">

第一轮循环

1~3 步骤：比较，两者 key 不同，不能复用

4 步骤：比较发现新的子节点头部节点和旧子节点的尾部节点 key 相同，因此我们执行第四个 else if 执行逻辑，旧的尾部节点移动到 oldStartVNode 对应的真实 dom 前面

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-30-22-54-23-image.png" title="" alt="" width="593">

接下来开始新的一轮循环

1 步骤：比较新旧子节点的头部节点 key，发现相等，都在头部所以只需要打补丁即可，不需要移动，并且更新索引值

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-30-22-58-39-image.png" title="" alt="" width="596">

再开始新的一轮循环

1 步骤直接匹配，同上，只需要打补丁和更新索引值就好了。到这一步不满足循环条件就直接跳出了

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-30-23-09-48-image.png" title="" alt="" width="601">

### 非理想状态情况考虑

上面的几种情况都是比较理想的情况，在每一轮的循环中，都可以匹配到相等的 key 值，但是非理想的状态下只能通过增加额外的处理方式来进行。

比如如下的这种情况：

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-30-23-13-44-image.png" title="" alt="" width="576">

这种情况，无论是哪一轮，都不能匹配上，如果我们用之前的代码，循环直接就死了

这里有个骚操作，就是拿新子节点的头部节点，去旧子节点中寻找与之相同的 key 的节点。

在这里我们用 p-2 去找旧子节点中的匹配节点，发现下标是 1，而新的位置下标是 0，比他大，说明 p-2 节点对应的真实 dom 应该移动到 oldStartVNode 对应 dom 位置之前，因此我们追加逻辑

```js
/** 双端diff算法 */
function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;
  // 四个索引
  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;
  // 四个索引对应的vNode
  let oldStartVNode = oldChildren[oldStartIdx];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[newStartIdx];
  let newEndVNode = newChildren[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVNode.key === newStartVNode.key) {
      // ...
    } else if (oldEndVNode.key === newEndVNode.key) {
      // ...
    } else if (oldStartVNode.key === newEndVNode.key) {
      // ...
    } else if (oldEndVNode.key === newStartVNode.key) {
      // ...
    } else {
      // 遍历旧的子节点组，找到与newStartIdx拥有相同的key值的元素
      const idxInOld = oldChildren.findIndex(
        (node) => node.key === newStartVNode.key
      );
      // idxInOld大于0，说明找到了可复用的节点，并且需要将其对应的真实dom移动到头部
      if (idxInOld > 0) {
        const vnodeToMove = oldChildren[idxInOld];
        // 先打补丁
        patch(vnodeToMove, newStartVNode, container);
        // 将vnodeToMove.el移动到oldStartVnode.el之前，用其做锚点
        insert(vnodeToMove.el, container, oldStartVNode.el);
        // 由于位置idxInOld处的节点所对应的真实dom已经移到了别处，所以这里我们直接设置这个vnode为undefined
        oldChildren[idxInOld] = undefined;
        // 最后更新newStartIdx到下一个位置
        newStartIdx = newChildren[++newStartIdx];
      }
    }
  }
}
```

移动之后的状态图如下：

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-30-23-50-11-image.png" title="" alt="" width="607">

之后再进行 2 轮的循环，最终索引会匹配到我们上面特殊处理后被置为 undefined 的节点，到了这一步我们也需要对 undefined 的情况做特殊处理，此时节点的状态如下

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-30-23-57-50-image.png" title="" alt="" width="610">

再循环的时候，我们需要绕过 undefined 的这一个已经处理过的节点，可能涉及的情况就是，头部节点和尾部节点都不存在的情况，因此加入判断逻辑。

```js
/** 双端diff算法 */
function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;
  // 四个索引
  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;
  // 四个索引对应的vNode
  let oldStartVNode = oldChildren[oldStartIdx];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[newStartIdx];
  let newEndVNode = newChildren[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      // ➕
      oldStartVNode = oldChildren[++oldStartIdx]; // ➕
    } else if (!oldEndVNode) {
      // ➕
      oldEndVNode = oldChildren[--oldEndIdx]; // ➕
    } else if (oldStartVNode.key === newStartVNode.key) {
      // ...
    } else if (oldEndVNode.key === newEndVNode.key) {
      // ...
    } else if (oldStartVNode.key === newEndVNode.key) {
      // ...
    } else if (oldEndVNode.key === newStartVNode.key) {
      // ...
    } else {
      // 遍历旧的子节点组，找到与newStartIdx拥有相同的key值的元素
      const idxInOld = oldChildren.findIndex(
        (node) => node.key === newStartVNode.key
      );
      // idxInOld大于0，说明找到了可复用的节点，并且需要将其对应的真实dom移动到头部
      if (idxInOld > 0) {
        const vnodeToMove = oldChildren[idxInOld];
        // 先打补丁
        patch(vnodeToMove, newStartVNode, container);
        // 将vnodeToMove.el移动到oldStartVnode.el之前，用其做锚点
        insert(vnodeToMove.el, container, oldStartVNode.el);
        // 由于位置idxInOld处的节点所对应的真实dom已经移到了别处，所以这里我们直接设置这个vnode为undefined
        oldChildren[idxInOld] = undefined;
        // 最后更新newStartIdx到下一个位置
        newStartIdx = newChildren[++newStartIdx];
      }
    }
  }
}
```

之后的流程就可以正常的进行了。

### 添加新元素情况

如下这种情况

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-31-10-30-26-image.png" title="" alt="" width="535">

经过一轮的循环会发现，1 2 3 4 步骤全部没有命中，那么我们会执行特殊的逻辑，以新节点的头部去旧子节点中去寻找与之 key 相等的，发现也没有命中。这里就需要补充逻辑，去弥补没有查找到的情况。

```js
/** 双端diff算法 */
function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;
  // 四个索引
  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;
  // 四个索引对应的vNode
  let oldStartVNode = oldChildren[oldStartIdx];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[newStartIdx];
  let newEndVNode = newChildren[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      // ...
    } else if (!oldEndVNode) {
      // ...
    } else if (oldStartVNode.key === newStartVNode.key) {
      // ...
    } else if (oldEndVNode.key === newEndVNode.key) {
      // ...
      newEndVNode = newChildren[--newEndIdx];
    } else if (oldStartVNode.key === newEndVNode.key) {
      // ...
    } else if (oldEndVNode.key === newStartVNode.key) {
      // ...
    } else {
      // 遍历旧的子节点组，找到与newStartIdx拥有相同的key值的元素
      const idxInOld = oldChildren.findIndex(
        (node) => node.key === newStartVNode.key
      );
      // idxInOld大于0，说明找到了可复用的节点，并且需要将其对应的真实dom移动到头部
      if (idxInOld > 0) {
        const vnodeToMove = oldChildren[idxInOld];
        // 先打补丁
        patch(vnodeToMove, newStartVNode, container);
        // 将vnodeToMove.el移动到oldStartVnode.el之前，用其做锚点
        insert(vnodeToMove.el, container, oldStartVNode.el);
        // 由于位置idxInOld处的节点所对应的真实dom已经移到了别处，所以这里我们直接设置这个vnode为undefined
        oldChildren[idxInOld] = undefined;
      } else {
        // 没有命中说明，是新节点在newChildren中的头部，因此需要将此新节点挂载到oldStartVNode对应dom的前面
        patch(null, newStartVNode, container, oldStartVNode.el);
      }
      // 最后更新newStartIdx到下一个位置
      newStartVNode = newChildren[++newStartIdx];
    }
  }
}
```

以上是在 1 2 3 4 轮中，都没有命中的情况才会考虑到新节点的情况，如果其中一轮命中了，那么新节点会被忽略掉，如下这种情况

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-31-14-47-06-image.png" title="" alt="" width="591">

在第 2 轮的比较中，能够匹配到相对应的 key 值，并且在后续的循环中都能一一对应找到节点，直至以下这种状态

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-31-15-50-48-image.png" title="" alt="" width="593">

这种状态已经表明，索引越界，循环跳出了，但是此时的 p-4 新增的这个几点也被忽略了，

因此我们还需要增加逻辑，去处理遗漏的新增节点。

遗漏的节点位于的区间就在于 newStartIdx 和 newEndIdx 之间，所以我们去循环遍历挨个挂载，挂载时候的锚点仍然是处于 oldStartVNode 对应 dom

```js
/** 双端diff算法 */
function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;
  // 四个索引
  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;
  // 四个索引对应的vNode
  let oldStartVNode = oldChildren[oldStartIdx];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[newStartIdx];
  let newEndVNode = newChildren[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // ...
  }

  // 循环结束后检查索引的情况，避免需要新增的节点被遗漏
  if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
    // 如果满足条件，我们去遍历遗漏节点，逐个挂载
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      // 以oldStartVNode对应的dom为锚点
      patch(null, newChildren[i], container, oldStartVNode.el);
    }
  }
}
```

### 移除不存在的元素

移除和新增的类似，都是在最后一步检查索引值，如下这种情况：

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-31-16-04-50-image.png" title="" alt="" width="605">

通过几次循环之后直到以下这种情况，此时的变量 newStartIdx 的值大于变量 newEndIdx 的值，停止循环，但是旧的一组节点中还存在未被处理的节点，所以应该将其移除，同理，此时是旧节点剩余，所以应该卸载在区间 oldStartIdx 和 oldEndIdx 之间的节点

<img src="file:///Users/leo/Library/Application%20Support/marktext/images/2023-01-31-16-25-31-image.png" title="" alt="" width="607">

```js
/** 双端diff算法 */
function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;
  // 四个索引
  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;
  // 四个索引对应的vNode
  let oldStartVNode = oldChildren[oldStartIdx];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[newStartIdx];
  let newEndVNode = newChildren[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // ...
  }

  // 循环结束后检查索引的情况，避免需要新增的节点被遗漏
  if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
    // 如果满足条件，我们去遍历遗漏节点，逐个挂载
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      patch(null, newChildren[i], container, oldStartVNode.el);
    }
  } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      unmount(oldChildren[i]);
    }
  }
}
```

到这里就都处理完了

## 快速diff算法
