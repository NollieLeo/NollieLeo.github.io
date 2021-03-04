---
title: 工作中常用的Git命令
date: 2021-03-04 15:37:00
tags:
- git
categories:
- git
---

## 常用的基本操作

### git init

这个`git init`不用多说，大家都知道这个命令是初始化当前目录变成可以使用`git`管理的仓库，并且是空的。

![git init](1.image)

### git clone 远程地址[url]

通过`git clone`命令从远程地址下载出来，这个也不用过多描述。

![git clone](2.image)

### git status

`git status`查看本次本地有多少个文件发生变更。可以看到`index.css`d和`index.html`发生变更

![git status](3.image)

### git log

`git log`查看当前提交的日志。

![git log](4.image)

### git diff

`git diff`是查看当前改动的文件具体代码内容比对。

![git diff](5.image)

### git checkout .

`git checkout .`就是所有有改动的全部恢复到原来的样子, 当然也可以恢复指定的如：`git checkout index.css`只恢复这个文件当前的修改。

![git checkout](6.image)

### git add .

`git add .`是将修改的内容新增到暂存区，也可以提交指定的的文件。

![git add](7.image)

### git commit -m "你的要提交的注释"

`git commit -m`这里的内容从暂存区写入到对象库中, **注意注释必须写**。

![git commit](8.image)

### git tag

查看当前tag标签

### git tag tagName(你的tag名称)

新建一个Tag标签

### git tag -a tagName -m "tag备注"

新建一个tag标签带有备注信息

### git show tagName(你的tag标签名)

查看当前tag备注信息

![git show tag](9.image)

### git push origin tagName(你的tag名称)

`git push origin v1.0`推送到远程

### git push origin branch(你的分支)

`git push origin branch`推送到远程仓库。

![git push origin branch](10.image)

### git pull origin branch(你的分支)

`git pull origin branch`从远程拉取到本地。

![git pull origin branch](11.image)

### git checkout branch(你的分支)

`git checkout branch`切换到别的分支上。

![git checkout branch](12.image)

### git checkout -b branch(你的分支)

`git checkout -b branch(分支名称)`新建一个分支并切换到该分支上。

![git checkout -b](13.image)

### git branch -v

`git branch -v`查看当前的分支并且后面带有最后一次提交的信息

![git branch -v](14.image)

### git branch -a

`git branch -a`查看当前所有的分支包括远程分支

![git branch -a](15.image)

### git branch branch(你的分支)

`git branch barnch(你的分支名称)`新建一个本地分支。

![git branch](16.image)

### git branch -D name(分支名)

`git branch -D name(分支名)` 删除本地分支，但是不能在当前的分支上删除当前分支，必须切换到别的分支上，删除其它分支。

![img](17.image)

### git remote -v

`git remote -v`查看源地址

![git remote -v](18.image)

### git remove remote name(源地址名字)

`git remove remote name`删除源地址。

![git remove remote name](19.image)

### git remote add name(源地址名字) 远程地址[url]

`git remote add name url`添加一个源地址为要提交仓库的地址。

![git remote add name](20.image)

### git fetch origin name(远程分支名称)

`git fetch origin name`如果我们本地没有该分支，远程有该分支，我们先拉下来远程分支，并且新建本地分支和远程分支关联上就可以了。

![git fetch](21.image)

### git merge name(要合并的分支名称)

`git merge name(要合并的分支名称)`将要合并的分支合并到其它分支上。将`test`分支上的代码合并到`develop`上。

![git merge](22.image)

## 特殊问题场景怎么解决

### 只想把一个提交合并到其它分支上

比如一个场景`develop`分支上有一些特殊的代码，所以不能把这个分支上的代码合并到`test`分支上，我们只想合并当前修改的代码，该怎么办呢`git cherry-pick`就是用来解决这问题的，来看下面例子。

![git cherry-pick](23.image)

上面example中，`git cherry-pick`后面跟着一个`id`这个`id`就是别的分支提交记录的`id`，查看这个`id`的话上面说过了使用`git log`查看日志。我这个案例代码是没有发生冲突情况的，那么有的小伙伴发生冲突的话，先解决冲突然后`git add .`在`git cherry-pick --continue`这个参数是继续执行当前的`git cherry-pick`过程。下面来查看几个参数

- `--continue` 用户解决代码冲突后，第一步将修改的文件重新加入暂存区（git add .），第二步使用下面的命令，让 Cherry pick 过程继续执行。
- `--abort` 发生代码冲突后，放弃合并，回到操作前的样子.
- `--quit`  发生代码冲突后，退出 Cherry pick，但是不回到操作前的样子

### 如果commit时注释写错了怎么办？

```
git commit --amend -m "重新提交注释"
```

![git commit --amend](24.image)

### 远程强制覆盖到本地

```
$ git fetch --all(下载远程库的所有内容)
$ git reset --hard origin/master(远程的分支名称)
$ git pull
复制代码
```

### commit提交完怎么撤回

`git reset HEAD~1`撤回刚才的注释，如果提交了2次`commit`那么就撤回2次`git reset HEAD~2`。

![git reset HEAD~1](25.image)

### Git开发错分支了

**没提交代码时**

```
git add .
git stash (把暂存区的代码放入到git暂存栈)
git checkout name(切换到正确的分支)
git stash pop(把git暂存栈的代码放出来)
复制代码
```

**提交代码后**

```
git reset HEAD~1  （最近一次提交放回暂存区, 并取消此次提交）
git stash (暂存区的代码放入到git暂存栈)
git checkout (应该提交代码的分支)
git stash pop (把git暂存栈的代码放出来)
git checkout  (切换到刚才提交错的分支上)
git push origin 错误的分支 -f  (把文件回退掉)
```