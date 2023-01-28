---
title: 算法之二叉搜索树的最近公共祖先
date: 2021-06-19 16:25:13
tags:
- 二叉树公共祖先
- 二叉搜索树
- 二叉树
- 算法
- 面试题
- Javascript
categories:
- 算法
---

#### [剑指 Offer 68 - I. 二叉搜索树的最近公共祖先](https://leetcode-cn.com/problems/er-cha-sou-suo-shu-de-zui-jin-gong-gong-zu-xian-lcof/)

给定一个二叉搜索树, 找到该树中两个指定节点的最近公共祖先。

百度百科中最近公共祖先的定义为：“对于有根树 T 的两个结点 p、q，最近公共祖先表示为一个结点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（一个节点也可以是它自己的祖先）。”

例如，给定如下二叉搜索树:  root = [6,2,8,0,4,7,9,null,null,3,5]

![image-20210619163242688](image-20210619163242688.png)



**实现**

**1.递归**

核心思路：
        1. 当 传入的祖先节点 同时大于/小于 p、q节点 更新祖先节点位置
            a. root 同时小于 p、q 基于BST的特性可知 期望的祖先节点 应该在右子树 root = root.right
            b. root 同时大于 p、q 基于BST的特性可知 期望的祖先节点 应该在左子树 root = root.left
           2. 当遇到/第一次 祖先节点root 不同时大于或小于 p、q的节点 即为我我们期望的最近公共祖先节点

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
var lowestCommonAncestor = function(root, p, q) {
    if (!root) return root

    if (root.val < p.val && root.val < q.val) {
        return lowestCommonAncestor(root.right, p, q)
    } else if (root.val > p.val && root.val > q.val) {
        return lowestCommonAncestor(root.left, p, q)
    } else {
        return root
    }
};
```



2.**迭代**

利用二叉搜索树的特点
首先判断 p 和 q 是否相等，若相等，则直接返回 p 或 q 中的任意一个，程序结束

若不相等，则判断 p 和 q 在向左还是向右的问题上，是否达成了一致
如果 p 和 q 都小于root, 哥俩一致认为向左👈，则 root = root.left
如果 p 和 q 都大于root, 哥俩一致认为向右👉，则 root = root.right
如果 p 和 q 哥俩对下一步的路线出现了分歧，说明 p 和 q 在当前的节点上就要分道扬镳了，当前的 root 是哥俩临别前一起走的最后一站
返回当前 root
程序结束

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
var lowestCommonAncestor = function (root, p, q) {
    if (!root) {
        return null
    }
    while (root) {
        if (root.val < q.val && root.val < p.val) {
            root = root.right
        } else if (root.val > q.val && root.val > p.val) {
            root = root.left
        } else {
            return root
        }
    }
};
```

