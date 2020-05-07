---
title: flex3个属性详解
date: 2020-03-16 13:18:33
categories:
- css
tags:
- flex
---

# Flex 3个属性详解

> **flex属性 flex:(flex-grow)(flex-shrink)(flex-basis)**

- **flex-grow** 一个数字，规定项目将相对于其他灵活的项目进行扩展的量（放大属性）
- **flex-shrink** 一个数字，规定项目将相对于其他灵活的项目进行收缩的量（缩小属性）
- **flex-basis** 项目的长度。合法值："auto"、"inherit" 或一个后跟 "%"、"px"、"em" 或任何其他长度单位的数字。（基本宽度）


### 1. flex: none 

等同于 （`flex: 0 0 auto`）

这时候容器完全不再灵活。即不能放大也不能缩小。

除了它不允许 flex-shrink 属性（不能缩小），即使元素可能会溢出。

![](1574993498581.png)

### 2. flex:initial(flex: 0 1 auto )

等同于（`0 auto`）

- `flex-grow`为0，则存在剩余空间也不放大 
- `flex-shrink`为1，则空间不足该项目缩小 z
- `flex-basis`为auto，则该项目本来的大小 ,长度等于灵活项目的长度。如果该项目未指定长度，则长度将根据内容决定。

```css
.parent {
    display: flex;
    width: 600px;
    border: 1px solid #000;
}
.parent>div {
    height: 100px;
}
.item1 {
    width: 100px;
    background-color: #666;
}

.item2 {
    width: 100px;
    background: blue;
}

.item3 {
    width: 100px;
    background: lightblue;
}
```

```html
<body>
    <div class="parent">
        <div class="item1"></div>
        <div class="item2"></div>
        <div class="item3"></div>
    </div>
</body>
```

![](1574992712098.png)

此时，**当容器剩余一些空闲空间时**，该属性使灵活的项目变得不灵活，因为其不能自由拉伸放大。

但是**当容器没有足够的空间时**，该属性允许其缩小到项目的最小值。

1. 设置前面两个元素为`flex: none, width:100px`

![](1574995110792.png)

2. 全是initial，width分别设置为：100px ，100px ，700px，此时已经超出了容器的宽度，这时候里头的3个元素自动收缩

   ![](1574995539373.png)

   

   **baseWidth**: flex-basis ? flex-basis : width (flex-basis的优先级比width高);

   **allWidth**: flex元素的flex-basis和，或者width和其的和，看优先级;

   **overflowWidth**: allwidth - 父容器width 

   每个flex元素缩小值计算：
   $$(baseWidth/allWidth) * overflowWidth$$
   所以这次情况是：div1宽度为100px - 100/900 * 300 = 66.66....

   

    

### 3. flex: auto

相当于 flex: 1 1 auto

这个时候，该属性使3个item完全灵活，它们能够吸收主轴上额外的空间。既可以自由放大也可以自由缩小。

![](1574998175148.png)

### 4. flex:< positive-number > <意为 正数>

等同于 **flex: < positive-number >  1  0px** 

当 flex 取值为一个非负数字，则该数字为 `flex-grow` 的值，`flex-shrink` 取 1，`flex-basis` 取 0%。

这个时候，该属性使弹性项目变得灵活，flex元素在主轴方向上的初始大小flex-basis为零。

项目将根据容器的大小按照自身的比例自由伸缩。
![](1575008755738.png)

根据他们`flex-grow`来计算他们分配到的宽度 :  
$$flexGrow * flexWidth$$

$$flexWidth = (600-allFlexBasisWidth)/(1+1+2) = (600 - 0)/4 =150px$$
由于flex:1 ,其中的flex-basis是为0px的，所以说,要根据自己div的宽度来决定元素的基础宽度，如果div没设置宽度那就根据内部元素的宽度撑开的宽度，例如：

如果这时候一个元素的**flex-basis**设置为**auto**

![](1575010449681.png)



这时候就需要根据这个设置了auto元素的宽度来进行计算，因为item2没有设置width所以得根据他的内容宽度来计算分配到的宽度。

当他没有设置flex属性的时候，内容宽度为99.08px

![](1575010656266.png)

所以算他在成为flex元素时候分配到的宽度为：

(600-99.08)/4=125.23

### 5. flex:< positive-number >  xxpx ||%xx

该属性和上边的CSS案例一致，即 当 flex 取值为一个非负数字和一个长度（px）或百分比（%），

则分别视为 flex-grow 和 flex-basis 的值，flex-shrink 默认取 1



*****

例题：

```css
<style type="text/css">
    .parent {
        display: flex;
        width: 600px;
        border: 1px solid #000;
    }

    .parent>div {
        height: 100px;
    }

    .item1 {
        background-color: #666;
        flex: 2 1 30%;
    }

    .item2 {
        width:100px;
        background: blue;
        flex: 2 1 auto;
    }

    .item3 {
        flex: 1 1 200px;
        background: lightblue;
    }
</style>
```

```html
<body>
    <div class="parent">
        <div class="item1"></div>
        <div class="item2"></div>
        <div class="item3"></div>
    </div>
</body>
```

计算出3个item的宽度

1. 先判断他们几个的basisWidth和是否超出了容器的宽度: 600*30% +200 + 0 = 380px <600px，故，剩余的宽度用于flex元素的宽度扩展
2. 计算伸展因子：(600 - 380)/ (2+2+1) = 44 px
3. 因此他们所分配到的宽度各为：2 * 44+180 ，2 * 44，1 * 44+200 



### 6. 归纳

每次去计算一个flexbox的元素宽度

1. flex-grow 不为0 的时候并且flex-basis宽度加起来不超出容器宽，以flex-basis为基准算伸展因子，当flex-grow为0时，flex-basis最大，width第二。

2. flex-grow 不为0的时候并且flex-basis为auto的时候，虽然有width值，但计算收缩因子时候这一块的flex-basis也只能算是0.

   
