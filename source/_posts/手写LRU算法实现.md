---
title: 手写LRU算法实现
date: 2023-02-25 15:34:21
tags:
- Javascript

categories:
- Javascript
- LRU

---

## 1.什么是 LRU？

LRU 英文全称是 Least Recently Used，英译过来就是”最近最少使用“的意思。 它是页面置换算法中的一种，我们先来看一段百度百科的解释。

### 百度百科：

> LRU 是一种常用的页面置换算法，选择最近最久未使用的页面予以淘汰。该算法赋予每个页面一个访问字段，用来记录一个页面自上次被访问以来所经历的时间 t，当须淘汰一个页面时，选择现有页面中其 t 值最大的，即最近最少使用的页面予以淘汰。

百度百科解释的比较窄，它这里只使用了页面来举例，我们通俗点来说就是：假如我们最近访问了很多个页面，内存把我们最近访问的页面都缓存了起来，但是随着时间推移，我们还在不停的访问新页面，这个时候为了减少内存占用，我们有必要删除一些页面，而删除哪些页面呢？我们可以通过访问页面的时间来决定，或者说是一个标准：在最近时间内，最久未访问的页面把它删掉。

### 通俗的解释：

> 假如我们有一块内存，专门用来缓存我们最近发访问的网页，访问一个新网页，我们就会往内存中添加一个网页地址，随着网页的不断增加，内存存满了，这个时候我们就需要考虑删除一些网页了。这个时候我们找到内存中最早访问的那个网页地址，然后把它删掉。
> 这一整个过程就可以称之为 LRU 算法。

虽然上面的解释比较好懂了，但是我们还有很多地方没有考虑到，比如如下几点：

当我们访问内存中已经存在了的网址，那么该网址是否需要更新在内存中的存储顺序。
当我们内存中还没有数据的时候，是否需要执行删除操作。

最后上一张图，就更容易理解了

![1677311955835](E:\Wechat\WeChat%20Files\wxid_4367jvw50ckg21\FileStorage\Temp\1677311955835.jpg)

上图就很好的解释了 `LRU` 算法在干嘛了，其实非常简单，无非就是我们往内存里面添加或者删除元素的时候，遵循**最近最少使用原则**。

## 2. 实现

```js
class LRUCache {
  constructor(length) {
    this.maxSize = length;
    this.cacheMap = new Map();
  }

  /** 存储数据，通过键值对的方式 */
  set(key, value) {
    if (this.cacheMap.has(key)) {
      this.cacheMap.delete(key);
    }

    this.cacheMap.set(key, value);

    if (this.cacheMap.size > this.maxSize) {
      const deleteKey = this.cacheMap.keys().next().value;

      this.cacheMap.delete(deleteKey);
    }
  }

  /** 获取数据, 可以理解为再访问了一遍，所以要把之前的删了，然后重新放到最前 */
  get(key) {
    if (!this.cacheMap.has(key)) {
      return null;
    }

    /** 暂存值 */
    const current = this.cacheMap.get(key);

    // 先删除这个值
    this.cacheMap.delete(key);

    // 再重新插入, 能保证当前key在最前面
    this.cacheMap.set(key, current);
  }
}

const LRUList = new LRUCache(5);

LRUList.set("weng", 1);

LRUList.set("kai", 2);

LRUList.set("min", 3);

LRUList.set("ha", 4);

LRUList.set("oi", 5);

LRUList.set("o121i", 6);

LRUList.get("weng");

console.log(LRUList.data);

```
