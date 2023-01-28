---
title: BFC块级格式化上下文
date: 2020-03-16 22:56:11
tags:
- BFC
- Css
categories:
- Css
---

[参考文章](https://www.jianshu.com/p/0d713b32cd0d)

[参考文章2](https://www.w3cplus.com/css/understanding-block-formatting-contexts-in-css.html)

## 什么是BFC？

BFC的全称为：**块格式化上下文(Block Formatting Context)** ，它是布局过程中生成块级盒子的区域，也是浮动元素与其他元素的交互限定区域。简单来说，BFC是一个独立的渲染区域 

官方解释：

> 一个块格式化上下文（block formatting context） 是Web页面的可视化CSS渲染出的一部分。它是块级盒布局出现的区域，也是浮动层元素进行交互的区域。
>  一个块格式化上下文由以下之一创建：
>
> - 根元素或其它包含它的元素
> - 浮动元素 (元素的 `float` 不是 `none`)
> - 绝对定位元素 (元素具有 `position` 为 `absolute` 或 `fixed`)
> - 内联块 (元素具有 `display: inline-block`)
> - 表格单元格 (元素具有 `display: table-cell`，HTML表格单元格默认属性)
> - 表格标题 (元素具有 `display: table-caption`, HTML表格标题默认属性)
> - 具有`overflow` 且值不是 `visible` 的块元素，
> - `display: flow-root`
> - `column-span: all` 应当总是会创建一个新的格式化上下文，即便具有 `column-span: all` 的元素并不被包裹在一个多列容器中。
> - 一个块格式化上下文包括创建它的元素内部所有内容，除了被包含于创建新的块级格式化上下文的后代元素内的元素。
>
> 块格式化上下文对于定位 (参见 float) 与清除浮动 (参见 clear) 很重要。定位和清除浮动的样式规则只适用于处于同一块格式化上下文内的元素。浮动不会影响其它块格式化上下文中元素的布局，并且清除浮动只能清除同一块格式化上下文中在它前面的元素的浮动。

按照综上所述的话，BFC是一个html盒子然后呢必须至少满足下列其中的任意一个条件

 - `float`的值不为`none`
 - `position`不为`static`或者`relative`
 -  `display`的值为 `table-cell`, `table-caption`, `inline-block`, `flex`, 或者 `inline-flex`中的其中一个
 - overflow的值不为visible



## 遵循规则

1. BFC在Web页面上是一个独立的容器，容器内外互不影响
2. 和标准文档流一样，BFC内的元素垂直方向的边距会发生重叠
3. BFC不会与浮动元素的盒子重叠
4. 计算BFC高度时即使子元素浮动也参与计算 



## 实现一个BFC

``` css
.container {
	overflow: hidden;
}
```

```html
<div class="container">
  test BFC
</div>
```



## BFC常见作用（特性，功能）

### 一. BFC中的盒子对齐

> 在BFC中，每个盒子的**左外边框**紧挨着包含块的**左边框**（从右到左的格式，则为紧挨右边框）。即使存在浮动也是这样的（尽管一个盒子的边框会由于浮动而收缩），除非这个盒子的内部创建了一个新的BFC浮动，盒子本身将会变得更窄）。

 <img src="https://www.w3cplus.com/sites/default/files/blogs/2015/1508/bfc-1.jpg" alt="BFC" style="zoom: 67%;" /> 

 简单来说，在上图中我们可以看到，所有属于同一个BFC的盒子都左对齐（左至右的格式），他们的左外边框紧贴着包含块的左边框。在最后一个盒子里我们可以看到尽管那里有一个浮动元素（棕色）在它的左边，另一个元素（绿色）仍然紧贴着包含块的左边框。关于为什么会发生这种情况的原理将会在下面的文字环绕部分进行讨论



### 二. BFC导致的外边距折叠

 在常规文档流中，盒子都是从包含块的顶部开始一个接着一个垂直堆放。两个兄弟盒子之间的垂直距离是由他们个体的外边距所决定的，但不是他们的两个外边距之和。

 <img src="https://www.w3cplus.com/sites/default/files/blogs/2015/1508/bfc-2.jpg" alt="BFC" style="zoom:80%;" /> 

 在上图中我们看到在红色盒子（一个`div`）中包含两个绿色的兄弟元素（`p`元素），一个BFC已经被创建。

```css
.container {
    overflow: hidden;
    background-color: yellow;
}

.container p {
    margin: 10px 0;
    background-color: green;
}
```

```html
<div class="container">
    <p>hsdsdsddd</p>
    <p>hsdsdsddd</p>
</div>
```

理论上两个兄弟元素之间的边距应该是来两个元素的边距之和（`20px`），但它实际上为`10px`。这就是被称为外边距折叠。当兄弟元素的外边距不一样时，将以最大的那个外边距为准。

![](image-20200318134622277.png)

另一种情况就是两个元素的margin值不一样，那么他们两个元素直接的距离就是他们最大的margin距离

```css
  .container p:first-of-type {
    margin: 10px 0;
    background-color: green;
  }
  .container p:nth-of-type(2){
    margin: 20px 0;
    background-color: green;
  }
```

![](image-20200318135655864.png)



### 三. 使用BFC防止外边距折叠

毗邻块盒子的垂直外边距折叠只有他们是在同一BFC时才会发生。如果他们属于不同的BFC，BFC是独立的容器， 容器内外互不影响 ，所以他们之间的外边距将不会折叠。所以通过创建一个新的BFC我们可以防止外边距折叠。

```html
<div class="container">
    <p>hsdsdsddd</p>
    <p>hsdsdsddd</p>
    <div class="newBfc">
      <p>sdadsadsa</p>
    </div>
</div>
```

```css
  .container {
    overflow: hidden;
    width: 200px;
    background-color: yellow;
  }

  .container p {
    margin: 10px 0;
    background-color: green;
  }

  .newBfc {
    overflow: hidden;
  }
```

<img src="image-20200318135206974.png" alt="" style="zoom:80%;" />



### 四. BFC和浮动问题

一个BFC可以包含住浮动的元素。一个容器中有浮动元素，我们大多时候是通过清除浮动的方式`clearfix`来解决，但也可以通过定义一个BFC来达到目的。

 ![BFC](https://www.w3cplus.com/sites/default/files/blogs/2015/1508/bfc-4.jpg) 

下面一个例子：

```html
  <style>
    .container {
      border: 10px solid yellow;
      min-height: 20px;
    }

    .in {
      height: 50px;
      width: 200px;
      float: left;
      background-color: forestgreen;
    }
  </style>
  <div class="container">
    <div class="in"></div>
  </div>
```



<img src="image-20200318141614117.png" alt="" style="zoom:80%;" />

此时如果加上`float:left`的话，就会脱离普通的文档流

<img src="image-20200318141742296.png" alt="" style="zoom:80%;" />

通过使得外层元素产生一个BFC从而包裹住内层浮动的元素

```HTML
  <style>
    .container {
      border: 10px solid yellow;
      min-height: 20px;
      overflow: hidden; 
      /* 产生BFC其中一个条件 */
    }

    .in {
      height: 50px;
      width: 200px;
      float: left;
      background-color: forestgreen;
    }
  </style>
  <div class="container">
    <div class="in"></div>
  </div>
```

<img src="image-20200318142031107.png" alt="" style="zoom:80%;" />



### 5. 解决浮动后发生元素重叠的问题

普通文档流中，当一个元素使用`float:left`脱离正常的文档流之后，会使得其他的元素与其发生重叠，BFC可以解决这个问题。

```html
  <style>
    .container {
     background: grey;
    }

    .left {
      height: 100px;
      width: 100px;
      background-color: red;
      float: left;
    }
    .right {
      height: 150px;
      width: 150px;
      background: green;
    }
  </style>
  <div class="container">
    <div class="left"></div>
    <div class="right"></div>
  </div>
```

<img src="image-20200318144231982.png" alt="" style="zoom:80%;" />

为了使其不发生重叠，可以使得right元素产生BFC（BFC容器内外互不影响）

```css
	.right {
      height: 150px;
      width: 150px;
      background: green;
      overflow: hidden;
    }
```

<img src="image-20200318144457476.png" alt="" style="zoom:80%;" />



### 六. 和浮动的元素能够产生边界

​	第五点说到了如何用BFC解决浮动产生的两个元素重叠的问题，一般来说要解决这种浮动的问题，都会让第五点中right元素的`margin-left`设置为left元素宽度，如果说要和浮动的元素产生边距的话，就需要 `距离+left元素宽度` 。

​	此时让right元素产生BFC之后，得让left的margin-right设置为你想要的边距。

```HTML
  <style>
    .container {
     background: grey;
    }

    .left {
      height: 100px;
      width: 100px;
      background-color: red;
      float: left;
      margin-right: 10px;
    }
    .right {
      height: 150px;
      width: 150px;
      background: green;
      overflow: hidden;
      margin-left: 10px;
    }
  </style>
  <div class="container">
    <div class="left"></div>
    <div class="right"></div>
  </div>
```

<img src="image-20200318150941105.png" alt="" style="zoom:80%;" />

### 七. 使用BFC防止文字环绕

 有时候一个浮动`div`周围的文字环绕着它（如下图中的左图所示）但是在某些案例中这并不是可取的，我们想要的是外观跟下图中的右图一样的。为了解决这个问题，我们可能使用外边距，但是我们也可以使用一个BFC来解决。

 <img src="https://www.w3cplus.com/sites/default/files/blogs/2015/1508/bfc-5.jpg" alt="BFC" style="zoom: 80%;" /> 

 首先让我们理解文字为什么会环绕。为此我们需要知道当一个元素浮动时盒子模型是如何工作的。

 这个`p`元素并没有移动，但是它却出现在浮动元素的下方。`p`元素的`line boxes`（指的是文本行）进行了移位。此处`line boxes`的水平收缩为浮动元素提供了空间。

 随着文字的增加，因为`line boxes`不再需要移位,最终将会环绕在浮动元素的下方，因此出现了那样的情况。这就解释了为什么即使在浮动元素存在时，段落也将紧贴在包含块的左边框上，还有为什么`line boxes`会缩小以容纳浮动元素。

 如果我们能够移动整个`p`元素，那么这个环绕的问题就可以解决了。

> 在BFC中，每个盒子的左外边框紧挨着左边框的包含块（从右到左的格式化时，则为右边框紧挨）。即使在浮动里也是这样的（尽管一个盒子的边框会因为浮动而萎缩），除非这个盒子的内部创建了一个新的BFC（这种情况下,由于浮动，盒子本身将会变得更窄）



```HTML
<div class="container"> 
    <div class="floated">Floated div</div> 
    <p>
        Quae hic ut ab perferendis sit quod architecto,dolor 			debitis quam rem provident aspernatur tempora expedita.
    </p> 
</div>
```

![](image-20200318151645115.png)

因此为了使其不产生这样文字环绕的效果可以使得p产生一个BFC，这样就不会紧紧挨了。

```HTML
  <style>
    .container {
     background: grey;
    }

    .floated {
      height: 20px;
      width: 100px;
      background-color: red;
      float: left;
    }
    p{
      display: flow-root;
    }
  </style>
  <div class="container"> 
    <div class="floated">Floated div</div> 
    <p>
        Quae hic ut ab perferendis sit quod architecto,dolor 			debitis quam rem provident aspernatur tempora expedita.
    </p> 
  </div>
```

![](image-20200318152917968.png)



### 八. 在多列布局中使用BFC

 如果我们正在创建的一个多列布局占满了整个容器的宽度，在某些浏览器中最后一列有时候将会被挤到下一行。会发生这样可能是因为浏览器舍入（取整）了列的宽度使得总和的宽度超过了容器的宽度。然而，如果我们在一个列的布局中建立了一个新的BFC，它将会在前一列填充完之后的后面占据所剩余的空间。

```html
  <style>
    .column {
      width: 31.33%;
      height: 100px;
      background-color: green;
      float: left;
      margin: 0 1%;
    }

    .column:last-child {
      float: none;
      overflow: hidden;
    }
  </style>
  <div class="container">
    <div class="column">column 1</div>
    <div class="column">column 2</div>
    <div class="column">column 3</div>
  </div>
```

![](image-20200318153802285.png)