---
title: 手写用js切换字符串大小写
published: 2023-02-27T21:46:31.000Z
description: >-
  如题 用 js 实现英文字母大小写的切换，也就是将字符串中的大写字母变成小写，小写字母变成大小。 示例：'123aBc' = '123AbC'  直接用
  ASCII 码来做  js  function switchLetterCase2(s) {   let res = "";    s.split...
tags:
  - JavaScript
  - ASCII
category: "前端开发"
---

如题
用 js 实现英文字母大小写的切换，也就是将字符串中的大写字母变成小写，小写字母变成大小。
示例：'123aBc' => '123AbC'

直接用 ASCII 码来做

````js

function switchLetterCase2(s) {
  let res = "";

  s.split('').forEach((letter) => {
    const asciiCode = letter.charCodeAt(0);
    if ((asciiCode > 64) & (asciiCode < 91)) {
      res += letter.toLowerCase();
    } else if ((asciiCode > 96) & (asciiCode < 123)) {
      res += letter.toUpperCase();
    } else {
      res += letter;
    }
  });

  return res;
}

console.log(switchLetterCase2('ASCII'))


```js
````
