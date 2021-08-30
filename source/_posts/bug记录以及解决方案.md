---
title: bug记录以及解决方案
date: 2021-08-12 09:45:16
tags:
- bugs

---



## UMI

- [解决umi项目引入React无智能提示，报错“React”指 UMD 全局，但当前文件是模块。请考虑改为添加导入。ts(2686)的问题。](https://www.cnblogs.com/tigerK/p/14902074.html)






## eslint

- ```
  Oops! Something went wrong!
  No files matching the pattern "./src/assets/scripts/**/*.js" were found.
  ```

  [解决方法](https://stackoverflow.com/questions/54543063/how-can-i-suppress-the-no-files-matching-the-pattern-message-in-eslint)





## husky

husky > commit-msg hook failed (add --no-verify to bypass)

-  ![img](https://img2020.cnblogs.com/blog/130424/202011/130424-20201103070144537-2082531156.png) 

  解决方法

  commitlint.config.js的编码修改为UTF-8

  ![img](https://img2020.cnblogs.com/blog/130424/202011/130424-20201103070158487-1521358444.png)