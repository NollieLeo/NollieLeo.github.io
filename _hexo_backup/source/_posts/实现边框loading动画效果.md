---
title: 实现边框loading动画效果
date: 2020-03-30 13:44:04
tags:
- Css
- loading动画
categories:
- Css
---

效果图如下

![](image-20200330134546508.png)



代码如下：

```html
<body>
  <style>
    .box {
      display: inline-block;
      position: relative;
      width: 220px;
      height: 100px;
      box-sizing: border-box;
    }

    .box::before {
      content: '';
      position: absolute;
      left: -4px;
      top: -4px;
      right: 0;
      width: 228px;
      height: 108px;
      bottom: 0;
      z-index: -1;
      box-sizing: border-box;
      border-radius: 5px;
      background: linear-gradient(to right, #0638a8, #0ab7f9, #06a892);
      box-sizing: border-box;
      animation: borderAround 1.5s infinite linear;
    }

    @keyframes borderAround {

      0%,
      100% {
        clip: rect(0 228px 4px 76px);
      }

      10% {
        clip: rect(0, 152px, 4px, 0);
      }

      20% {
        clip: rect(0, 76px, 54px, 0);
      }

      30% {
        clip: rect(0, 4px, 112px, 0);
      }

      40% {
        clip: rect(54px, 76px, 112px, 0);
      }

      50% {
        clip: rect(104px, 152px, 112px, 0);
      }

      60% {
        clip: rect(104px, 228px, 112px, 76px);
      }

      70% {
        clip: rect(54px, 228px, 112px, 152px);
      }

      80% {
        clip: rect(0, 228px, 112px, 224px);
      }

      90% {
        clip: rect(0, 228px, 54px, 152px);
      }
    }

    .child {
      width: 100%;
      height: 100%;
      background: #FFF;
      z-index: 999;
    }
  </style>

  <div class="box">
    <div class="child">
      dsadasd
    </div>
  </div>
</body>
```

