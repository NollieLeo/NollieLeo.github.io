---
title: fr单位配合grid布局
date: 2021-03-12 11:09:25
tags:
- grid布局
- Css
categories:
- Css
---

在网格布局中的运用

> 网格布局支持弹性尺寸（flex-size），这是一个很好的自适应布局技术。
> fr是一个相对尺寸单位，表示剩余空间做等分，此项分配到的百分比(如果只有一个项使用此单位，那就占剩余空间的100%，所以多个项联合使用更有意义) 
>
> 弹性尺寸使用fr尺寸单位，其来自 “fraction” 或 “fractional unit” 单词的前两个字母，表示整体空间的一部分。

结合grid布局可以实现等分行列的烦恼

### 示例

![1.png](1.png)

代码如下

```html
<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 20px;
    width: 500px;
    padding: 10px;
    background: bisque;
  }
  .grid-item {
    background-color: aquamarine;
  }
</style>
<div class="grid">
  <div class="grid-item">
    <p>12121</p>
  </div>
  <div class="grid-item">
    <p>12121</p>
  </div>
  <div class="grid-item">
    <p>12121</p>
  </div>
</div>
```

### 坑

如果内部的元素内容很多就会容易造成不等分的情况

如图

![image-20210312113529373](2.png)

解决方案

```css
grid-template-columns: repeat(3, minmax(10px,1fr));
```

给了10px的最小宽度值。解决了最小宽度不确定导致的溢出问题、同时10px最小宽度比起0px避免了元素直接消失，当问题出现时可减小调试成本。

