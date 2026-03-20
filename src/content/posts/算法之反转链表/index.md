---
title: 算法之反转链表
published: 2021-06-13T15:00:44.000Z
description: >-
  206.给你单链表的头节点 head,请你反转链表，并返回反转后的链表    迭代解法：  js if(!head){         return
  head;     }     const virsualNode = new ListNode();     virsualNode.next = ...
tags:
  - 链表
  - 面试题
  - 算法
  - JavaScript
category: 计算机基础
---

206.给你单链表的头节点 `head`,请你反转链表，并返回反转后的链表

![image-20210613150413850](./image-20210613150413850.png)

迭代解法：

```js
if(!head){
        return head;
    }
    const virsualNode = new ListNode();
    virsualNode.next = head;
    while(head.next){
        let temp = head.next;
        head.next = head.next.next;
        temp.next = virsualNode.next;
        virsualNode.next = temp;
    }
    return virsualNode.next
```

