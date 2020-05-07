---
title: 布局详解
date: 2020-03-16 17:05:18
tags:
---

## flex布局深入了解

### 1. flex布局

#### **flex容器的属性**

| 属性名称          | 属性含义                                     | 属性可能的值                                                 |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------ |
| `flex-direction`  | 决定主轴的方向                               | `row`(默认) 水平，起点在左端<br>`row-reverse`水平，起点在右端<br>`column`:垂直，起点在上沿`column-reverse`:垂直，起点在下沿 |
| `flex-wrap`       | 决定一条轴线放不下，如何换行                 | `Nowrap`(默认) 不换行<br>`Wrap`:换行，第一行在上面<br>`Wrap-reverse`:换行，第一行在下面 |
| `flex-flow`       | 是上面两个属性的简写                         | 默认值是 `row nowrap`                                        |
| `justify-content` | 定义项目在主轴上的对齐方式                   | `Flex-start`(默认值）左对齐<br>`Flex-end` 右对齐<br>`Center`居中<br>`Space-between`:两端对齐，项目之间的间隔都相等<br>`Space-around`:每个项目之间的间隔相等，所以项目之间的间隔比项目与边框之间的间隔大一倍 |
| `align-items`     | 定义项目在交叉轴上如何对齐                   | `Flex-start`交叉轴的起点对齐<br>`Flex-end`交叉轴的终点对齐<br>`Center`:交叉轴的中点对齐<br>`Baseline`：项目的第一行文字的基线对齐<br>`Stretch` （默认值）如果项目未设置高度或者设为auto，将占满整个容器的高度 |
| `align-content`   | 定义多跟轴线对齐方式，一条轴线该属性不起作用 | `Flex-start`: 与交叉轴的起点对齐<br>`Flex-end` 与交叉轴的终点对齐<br>`Center`:与交叉轴的中点对齐<br>`Space-between`:与交叉轴的两端对齐，轴线之间的间隔平均分布<br>`Space-around`：每根轴线之间的间隔都相等，所以轴线之间的间隔比轴线与边框之间的间隔大一倍 |

#### **flex容器下面项目的属性 **

| 属性名称      | 属性含义                                                     | 属性可能的值                                                 |
| ------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| `order`       | 定义项目的排列顺序，数值越小，排列越靠前                     | 默认0                                                        |
| `flex-grow`   | 定义项目的放大比例，如果存在剩余空间，不放大                 | 默认0（如果所有项目的`flex-grow`属性为1，则等分剩余空间）    |
| `flex-shrink` | 定义项目的缩小比例                                           | 默认1 负值对该属性无效                                       |
| `flex-basis`  | 定义在分配多余空间之前，项目占据的主轴空间，浏览器根据这个属性来计算主轴是否有多余空间 | 默认`auto`,即项目本来大小                                    |
| `flex`        | 是上面三个的简写                                             | 默认值 0 1 auto 后两个值可选                                 |
| `align-self`  | 允许单个项目与其他项目不一样的对齐方式，可覆盖`align-items`属性 | 默认值auto 表示继承父元素的`align-items`属性，如果没有父元素，则等同于`stretch` |

### 2.1 常用的垂直居中

#### css

```css
.container {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 500px;
            background: #666;
        }

.box {
            width: 200px;
            height: 200px;
            background: #ff0;
        }
```

#### Html

```html
<div class="container">
       <div class="box">hello 翁恺敏</div>
</div>
```

效果图：  
![](https://minio.choerodon.com.cn/knowledgebase-service/file_ecda5fce38594ff7b893af8dd5cb68c4_blob.png)

### 2.2 常用的ul,li布局横向等宽排列

![](https://minio.choerodon.com.cn/knowledgebase-service/file_cfc8e57740604e10bd9378889fde1e68_blob.png)

#### Html

```html
<ul class="container">
        <li>翁</li>
        <li>恺</li>
        <li>敏</li>
        <li>你</li>
        <li>好</li>
    </ul>
```

#### css

```css
.container {
            width: 500px;
            display: flex;
            list-style: none;
            padding: 0;
        }
        .container >li{
            flex: 1;
            height: 50px;
        }
        .container >li:nth-of-type(2n){
            background: red
        }
        .container >li:nth-of-type(2n-1){
            background: green
        }
```

### 2.3 骰子布局详解

![](https://minio.choerodon.com.cn/knowledgebase-service/file_f6079317a2e3445796478176bc306d7c_blob.png)  
![](https://minio.choerodon.com.cn/knowledgebase-service/file_7a65571cbb25432a9de4a6557c40b141_blob.png)

#### 2.3.1 单项目

> 首先，只有左上角1个点的情况。Flex布局默认就是首行左对齐，所以一行代码就够了。

![](https://minio.choerodon.com.cn/knowledgebase-service/file_45c389ba290f42c3af741f50942f5a88_blob.png)

```css
.box {
  display: flex;
}
```

- - -

> 设置项目的对齐方式，就能实现居中对齐和右对齐。

![](https://minio.choerodon.com.cn/knowledgebase-service/file_05b27b46c345437797abed62d73b959a_blob.png)

```css
.box {
  display: flex;
  justify-content: center;
}
```

- - -

![](https://minio.choerodon.com.cn/knowledgebase-service/file_a845891f97f6458fa000d0e1ad7d79ee_blob.png)

```css
.box {
  display: flex;
  justify-content: flex-end;
}
```

- - -

> 设置交叉轴对齐方式，可以垂直移动主轴。垂直居中

![](https://minio.choerodon.com.cn/knowledgebase-service/file_8b036161a4df4824b1063f829207a698_blob.png)

```css
.box {
  display: flex;
  align-items: center;
}
```

- - -

![](https://minio.choerodon.com.cn/knowledgebase-service/file_5434f7b72e9b4aa5a28859941622ff2d_blob.png)

```css
.box {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

- - -

![](https://minio.choerodon.com.cn/knowledgebase-service/file_be4232dfd726459b92a1ae3e80ce4342_blob.png)

```css
.box {
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
```

![](https://minio.choerodon.com.cn/knowledgebase-service/file_37247d42221d40babf93bc802e10f617_blob.png)

```css
.box {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}
```

- - -

#### 2.3.2 双项目

![](https://minio.choerodon.com.cn/knowledgebase-service/file_4843452462524a108303291045b5cdf4_blob.png)

```css
.box {
  display: flex;
  justify-content: space-between;
}
```

- - -

![](https://minio.choerodon.com.cn/knowledgebase-service/file_e8b334c7d27d437e95c9c60e560c333f_blob.png)

```css
.box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
```

- - -

![](https://minio.choerodon.com.cn/knowledgebase-service/file_7007b1fd8de2451184e637542da7043c_blob.png)

```css
.box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
```

- - -

![](https://minio.choerodon.com.cn/knowledgebase-service/file_5a55fd7f8e564cc987637c07375ec35b_blob.png)

```css
.box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
```

- - -

![](https://minio.choerodon.com.cn/knowledgebase-service/file_dd0c4cb6c6294864b5ee55eaf70999b7_blob.png)

```css
.box {
  display: flex;
}

.item:nth-child(2) {
  align-self: center;
}
```

- - -

![](https://minio.choerodon.com.cn/knowledgebase-service/file_6c83dbcb80c247909bf08fec24431e69_blob.png)

```css
.box {
  display: flex;
  justify-content: space-between;
}

.item:nth-child(2) {
  align-self: flex-end;
}
```

- - -

#### 2.3.3 三项目

![](https://minio.choerodon.com.cn/knowledgebase-service/file_c807a61bd2ea4fa08d2ddb89f490da88_blob.png)

```css
.box {
  display: flex;
}

.item:nth-child(2) {
  align-self: center;
}

.item:nth-child(3) {
  align-self: flex-end;
}
```

- - -

#### 2.3.3 四项目

![](https://minio.choerodon.com.cn/knowledgebase-service/file_679f1c5cec374c8da5a46484ff8b4e8e_blob.png)

```css
.box {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-content: space-between;
}
```

- - -

![](https://minio.choerodon.com.cn/knowledgebase-service/file_d9295ac403c24c11926e9a69875e00fb_blob.png)  
HTML

```html
<div class="box">
  <div class="column">
    <span class="item"></span>
    <span class="item"></span>
  </div>
  <div class="column">
    <span class="item"></span>
    <span class="item"></span>
  </div>
</div>
```

css

```css
.box {
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
}

.column {
  flex-basis: 100%;
  display: flex;
  justify-content: space-between;
}
```
#### 2.3.4  六项目
![](https://minio.choerodon.com.cn/knowledgebase-service/file_1ad2ee2075364173bc1464044f04395d_blob.png)
```css

.box {
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
}
```
***
![](https://minio.choerodon.com.cn/knowledgebase-service/file_c5505f05517e4619bcd2f768936da6e9_blob.png)
```css
.box {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: space-between;
}
```

### 2.4 圣杯布局（常见）
![](https://minio.choerodon.com.cn/knowledgebase-service/file_6843bc851bbd4a6aa3477ca0286cce47_blob.png)

#### html
```html
<div class="container">
        <header>Header</header>
        <div class="content">
            <main>Main</main>
            <nav>Nav</nav>
            <aside>Aside</aside>
        </div>
        <footer>Footer</footer>
    </div>
```
#### css
```css
* {
            margin: 0;
            padding: 0;
        }

        html,
        body {
            width: 100%;
            height: 100%;
        }

        .container {
            display: flex;
            /* 垂直*/
            flex-direction: column;
            width: 100%;
            /*视口被均分为100单位的vh 占据整个窗口*/
            min-height: 100vh;
        }

        header,
        footer {
            background: #999;
            /*放大缩小比例为0 占据垂直方向80px*/
            flex: 0 0 80px;
        }

        .content {
            display: flex;
            /*1 1 auto 后两个值省略*/
            flex: 1;
        }

        nav {
            /*默认 0 数值越小 排列越靠前*/
            order: -1;
            flex: 0 0 80px;
            background: royalblue;
        }

        aside {
            flex: 0 0 80px;
            background: aqua;
        }

        main {
            flex: 1;
            background: green;
        }
```