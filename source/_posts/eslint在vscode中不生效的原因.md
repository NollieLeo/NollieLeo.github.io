---
title: eslint在vscode中不生效的原因
date: 2021-08-12 09:44:34
tags:
- eslint
categories:
- eslint

---

#### 检查是否配置以下内容

- package.json中是否配置了eslint依赖

  ![img](https:////upload-images.jianshu.io/upload_images/7254079-39efc1542b6d04c8.png?imageMogr2/auto-orient/strip|imageView2/2/w/579/format/webp)

- 工程目录下是否有.eslintrc.js和.eslintignore文件

  ![img](https:////upload-images.jianshu.io/upload_images/7254079-7f70a6381f9c2629.png?imageMogr2/auto-orient/strip|imageView2/2/w/344/format/webp)

  2.查看vscode是否安装了eslint插件并**启用**

  ![img](https:////upload-images.jianshu.io/upload_images/7254079-617563f3d59c558f.png?imageMogr2/auto-orient/strip|imageView2/2/w/839/format/webp)

- setting.json里是否有eslint的配置项

  ![img](https:////upload-images.jianshu.io/upload_images/7254079-8269c7c303d8cbda.png?imageMogr2/auto-orient/strip|imageView2/2/w/743/format/webp)

- vscode状态栏 eslitn是否开启，显示打勾状态
   

  ![img](https:////upload-images.jianshu.io/upload_images/7254079-6fb08c702d2a7a73.png?imageMogr2/auto-orient/strip|imageView2/2/w/483/format/webp)

  5.备注：vscode状态栏显示禁用或者报错都会导致eslint不生效

  ![img](https:////upload-images.jianshu.io/upload_images/7254079-f28eed3552a52128.png?imageMogr2/auto-orient/strip|imageView2/2/w/702/format/webp)

  6. 解决方法：以上两种情况点击状态栏上eslint分别弹出以下弹窗，点击allow按钮即可

  ![img](https:////upload-images.jianshu.io/upload_images/7254079-31a01ce5957c6e76.png?imageMogr2/auto-orient/strip|imageView2/2/w/674/format/webp)