---
title: 项目初始化-HTML模板
date: 2020-03-18 22:56:11
tags:
- html
categories:
---

我们在项目初始化的时候，都会有一个html的模板，里面会做各种兼容和声明等工作。PC端如果需要适配IE8需要加入很多垫片，而且还要做好双核浏览器的优先选择配置等；M端更是需要做到不同分辨率屏幕的适配，另外还有300ms延迟问题。这里送上笔者在项目当中整理的两个模板，已经经过了一定项目的考验，供大家参考。

另外，本文中涉及的M端适配并非rem，而是修改viewport的显示比例，这个方案相较rem来说起码有2个优点：一是省字符，二是不用计算，设计稿是多少就是多少。不过在实践当中，UC浏览器貌似不认user-scalabe=0，还是会被双击放大，不过笔者认为还是可以接受的。如果还遇到了其他bug，请反馈，谢谢。

## PC模板

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="renderer" content="webkit" />
    <title>Document</title>
<!--[if lt IE 9]>
    <script src="//cdn.staticfile.org/html5shiv/r29/html5.min.js"></script>
    <script src="//cdn.staticfile.org/respond.js/1.4.2/respond.min.js"></script>
    <script src="//cdn.staticfile.org/es5-shim/4.5.9/es5-shim.min.js"></script>
    <script src="//cdn.staticfile.org/es5-shim/4.5.9/es5-sham.min.js"></script>
<![endif]-->
    <link rel="stylesheet" href="//cdn.staticfile.org/normalize/6.0.0/normalize.min.css">
</head>
<body>
</body>
</html>
```



## M模板

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8" />
    <meta name="format-detection" content="telephone=no" />
    <title>Document</title>
    <script>
    (function() {
        var w = 750; // 设计稿尺寸
        document.write('<meta name="viewport" content="width=' + w + ', initial-scale=' + 		  window.screen.width / w + ', user-scalable=0" />');
    })()
    </script>
    <link rel="stylesheet" href="//cdn.staticfile.org/normalize/6.0.0/normalize.min.css">
</head>
<body>
    <script src="//cdn.staticfile.org/fastclick/1.0.6/fastclick.min.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        Origami.fastclick(document.body);
    }, false);
    </script>
</body>
</html>
```



## 公共部分说明

1、<!DOCTYPE html>
在 HTML 4.01 中，<!DOCTYPE> 声明引用 DTD，因为 HTML 4.01 基于 SGML。DTD 规定了标记语言的规则，这样浏览器才能正确地呈现内容。HTML5 不基于 SGML，所以不需要引用 DTD。
请始终向 HTML 文档添加 <!DOCTYPE> 声明，这样浏览器才能获知文档类型。它不是 HTML 标签，是指示 web 浏览器关于页面使用哪个 HTML 版本进行编写的指令；必须是 HTML 文档的第一行，位于 <html> 标签之前，没有结束标签，对大小写不敏感；
参考文献：http://www.w3school.com.cn/tags/tag_doctype.asp 

2、<html lang="zh">
HTML 的 lang 属性可用于网页或部分网页的语言。这对搜索引擎和浏览器是有帮助的。根据 W3C 推荐标准，您应该通过 <html> 标签中的 lang 属性对每张页面中的主要语言进行声明。
参考文献：http://www.w3school.com.cn/tags/html_ref_language_codes.asp

3、<meta charset="UTF-8" />
当你的 html 文件是以 UTF-8 编码保存的，而且里面有中文，你试试加与不加在 Chrome 的效果你就知道有没有区别了

4、<meta name="format-detection" content="telephone=no,email=no,adress=no" />
告诉浏览器是否识别特定格式的文本。根据项目需求修改值。

##  **PC部分说明** 

1、<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
控制IE渲染内核的选择。chrome=1针对装了chrome frame插件的IE浏览器起作用，以防万一写上。
参考文献：https://msdn.microsoft.com/en-us/library/ff955275(v=vs.85).aspx

2、<meta name="renderer" content="webkit|ie-comp|ie-stand" />
控制双核浏览器渲染引擎，content的取值为webkit、ie-comp、ie-stand之一，区分大小写，分别代表用webkit内核，IE兼容内核，IE标准内核。
参考文献：http://se.360.cn/v6/help/meta.html

3、<!--[if lt IE 9]> //code here
兼容IE9以下（不含）的写法，只有IE认。（例子中js为IE9-的垫片）
参考文献：http://www.weste.net/2013/8-9/93104.html



## M部分说明

1、js输出viewport缩放屏幕，适配不同大小设备

```HTML
(function() {
    var w = 750; //设计稿设备宽度
    document.write('<meta name="viewport" content="width=' + w + ', initial-scale=' + 	  window.screen.width / w + ', user-scalable=0" />');
})()
```

加入以上代码，需修改变量值为设计稿的设备宽度，样式全部按照设计稿的数值和单位写就可以。详见：移动端常用布局方法
参考文献：http://www.cnblogs.com/2050/p/3877280.html

2、fastclick解决iphone等手机的300ms延迟问题

```html
<script src="//st01.chrstatic.com/themes/chr-cdn/fastclick/v1.0.6/fastclick.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        Origami.fastclick(document.body);
    }, false);
</script>
```

先加载fastclick.min.js，之后将需要去除300ms的dom挂上，压缩版写Origami.fastclick(document.body);，非压缩版写FastClick.attach(document.body);即可
参考文献：https://github.com/ftlabs/fastclick/