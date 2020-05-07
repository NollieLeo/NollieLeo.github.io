---
title: CSS盒子模型
date: 2020-03-25 09:22:07
tags:
- css
- 盒子模型
categories:
- css
---

# css盒子模型

先看例子：

```html
  <style>
    div {
      width: 300px;
      height: 400px;
      border: 5px solid #ccc;
      background-color: aqua;
      padding: 20px;
    }
  </style>
  <div></div>
```

![](image-20200325100338772.png)

如图所示：设置一个宽300px,高400px的div，border为5px，padding值设为20px.

这里我们会发现明明我们设置了`300*400`长宽比，为什么呈现出来的是一个`350*450`的盒子呢？ 

我们可以看一下这个图：

![](image-20200325100748520.png)

在这张图中，我们发现我们设置的`300*400`出现在了最里面的那个蓝框中，与此同时我们可以发现在这个盒模型中除了我们设置的内容（`content`），还有`margin`（外边距）、`border`（边框）、`padding`（内边框）

> `margin(外边距)` - 清除边框外的区域，外边距是透明的。
> `border(边框)` - 围绕在内边距和内容外的边框。
> `padding(内边距)` - 清除内容周围的区域，内边距是透明的。
> `content(内容)` - 盒子的内容，显示文本和图像。 

为了正确设置元素在所有浏览器中的宽度和高度，你需要知道盒模型是如何工作的。

而我们在测试效果图看到的350*450盒子，

350（width） = 300（content） + 20（padding）* 2 + 5（border）* 2
450（height）= 400 （content）+ 20（padding）* 2 + 5（border）* 2



## css的两种盒子模型

css的两种盒子模型不同

### W3C的标准盒模型

![](20180324150509906.jpg)

> **在标准的盒子模型中，width指content部分的宽度** 

### IE的盒模型

![](20180324150533356.jpg)

> **在IE盒子模型中，width表示content+padding+border这三个部分的宽度**



 我们可以看出我们上面的使用的默认正是`W3C标准盒模型` 



## 盒子模型类型的切换

如果想要切换盒模型也很简单，这里需要借助css3的`box-sizing`属性

> - `box-sizing: content-box` 是W3C盒子模型
> - `box-sizing: border-box` 是IE盒子模型

**box-sizing的默认属性是content-box**