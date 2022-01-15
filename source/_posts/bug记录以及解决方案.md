---
title: bug记录以及解决方案
date: 2021-08-12 09:45:16
tags:
- bugs
---



## Electron

- 



## chrome devtools

- [Error message "DevTools failed to load SourceMap: Could not load content for chrome-extension://..."](https://stackoverflow.com/questions/61339968/error-message-devtools-failed-to-load-sourcemap-could-not-load-content-for-chr)



## PostCss

- Error: PostCSS plugin autoprefixer requires PostCSS 8. Update PostCSS or downgrade this plugin。

  https://blog.csdn.net/qq_38385108/article/details/108693404

## VScode

- 解决VSCODE"因为在此系统上禁止运行脚本"报错

  https://blog.csdn.net/larpland/article/details/101349586



## UMI

- [解决umi项目引入React无智能提示，报错“React”指 UMD 全局，但当前文件是模块。请考虑改为添加导入。ts(2686)的问题。](https://www.cnblogs.com/tigerK/p/14902074.html)






## eslint

- ```
  Oops! Something went wrong!
  No files matching the pattern "./src/assets/scripts/**/*.js" were found.
  ```

  [解决方法](https://stackoverflow.com/questions/54543063/how-can-i-suppress-the-no-files-matching-the-pattern-message-in-eslint)
  
- 'lodash' should be listed in the project's dependencies, not devDependencies.eslint[import/no-extraneous-dependencies](https://github.com/import-js/eslint-plugin-import/blob/v2.24.2/docs/rules/no-extraneous-dependencies.md)

  [解决方法](https://stackoverflow.com/questions/50421664/eslint-html-webpack-plugin-should-be-listed-in-the-projects-dependencies-not)



## webpack5

- [Webpack 5 - Uncaught ReferenceError: process is not defined](https://stackoverflow.com/questions/65018431/webpack-5-uncaught-referenceerror-process-is-not-defined)




## husky

husky > commit-msg hook failed (add --no-verify to bypass)

-  ![img](https://img2020.cnblogs.com/blog/130424/202011/130424-20201103070144537-2082531156.png) 

  解决方法

  commitlint.config.js的编码修改为UTF-8

  ![img](https://img2020.cnblogs.com/blog/130424/202011/130424-20201103070158487-1521358444.png)