---
title: .gitingnore匹配规则以及语法
date: 2020-03-19 09:17:13
tags:
- git
categories:
- git
---

# Git配置 .gitignore文件

git [廖雪峰git教程](https://www.liaoxuefeng.com/wiki/896043488029600)

[git官网](https://git-scm.com/docs/gitignore)

## 一. 忽略规则匹配语法

| 通配符 | 说明                               |
| ------ | ---------------------------------- |
| 空格   | 仅作为分隔符                       |
| #      | 注释                               |
| !      | 不忽略某个文件                     |
| / 开头 | 仅仅匹配根目录                     |
| 结束 / | 匹配该文件夹及该文件夹下的所有内容 |
| *      | 匹配多个字符                       |
| **     | 匹配多级目录                       |
| ？     | 匹配单个字符                       |
| []     | 匹配包含单个字符的列表             |

Tips:

- 当前目录定义的规则优先级高于父级目录定义的规则
- 每行指定一条忽略规则
- 如果一行规则不包含“/”，则它匹配当前.gitignore文件所在路径的内容



## 二. 匹配示例

| 规则          | 说明                                                         |
| :------------ | :----------------------------------------------------------- |
| abc/          | # 忽略当前路径下的 abc 文件夹                                |
| /abc          | # 忽略根目录下的 abc 文件                                    |
| /*.txt        | # 忽略根目录下的 abc.txt，不忽略 app/abc.txt                 |
| abc/*.txt     | # 忽略 abc/abc.txt，不忽略 abc/def/abc.txt 和 app/abc/abc.txt |
| **/abc        | # 忽略 /abc、a/abc、a/b/abc                                  |
| a/**/b        | # 忽略 a/b、a/x/y/b                                          |
| !/app/abc.txt | # 不忽略 app 目录下的 abc.txt 文件                           |
| *.log         | # 忽略所有 .log 文件                                         |
| abc.txt       | #忽略当前路径下的 abc.txt 文件                               |
| *abc/         | #忽略名词中末尾为abc的文件夹                                 |
| * abc */      | #忽略名称中间包含abc的文件夹                                 |



## 三.  .gitignore文件不生效

`.gitignore`只能忽略那些原来没有被track的文件，如果某些文件已经被纳入了版本管理中，则修改`.gitignore`是无效的。所以一定要养成在项目开始就创建`.gitignore`文件的习惯。
 解决方法就是先把本地缓存删除(改变成未track状态)，然后再提交：

- 如果远程仓库原来就已经存在现在.gitignore规则中忽略的内容，那么现在那些规则对那些内容是无效的，必须先删除本地缓存

  `$ git rm -r --cached`

- 不过，这样做虽然可以删除远程仓库里被 .gitignore 规则忽略的内容，但是这些内容的 git 压缩版本依然被保存在可回滚记录中以备以后回滚，这会导致 git 仓库过大。虽然有一些办法可以给 git 仓库进行瘦身，但是操作比较繁琐，非常的不推荐。因此，个人觉得还是应该有良好的 git 使用习惯，对于不用提交到仓库的内容，要第一时间用 .gitignore 进行过滤。对于占用空间小的内容，可以不予理会，但如果有较多、较大文件，不光是占了太多的远程仓库空间和本地空间，并且在 clone、push 的时候，也会因为仓库过大，而影响 clone 速度。

## 四. 模板

### java 开发通用版本模板

```.gitignore
#java
*.class

#package file
*.war
*.ear
*.zip
*.tar.gz
*.rar
#maven ignore
target/
build/

#eclipse ignore
.settings/
.project
.classpatch

#Intellij idea
.idea/
/idea/
*.ipr
*.iml
*.iws

# temp file
*.log
*.cache
*.diff
*.patch
*.tmp

# system ignore
.DS_Store
Thumbs.db
```

### 前端项目

```.gitignore
# Numerous always-ignore extensions
*.bak
*.patch
*.diff
*.err
 
# temp file for git conflict merging
*.orig
*.log
*.rej
*.swo
*.swp
*.zip
*.vi
*~
*.sass-cache
*.tmp.html
*.dump
 
# OS or Editor folders
.DS_Store
._*
.cache
.project
.settings
.tmproj
*.esproj
*.sublime-project
*.sublime-workspace
nbproject
thumbs.db
*.iml
 
# Folders to ignore
.hg
.svn
.CVS
.idea
node_modules/
jscoverage_lib/
bower_components/
dist/
```





