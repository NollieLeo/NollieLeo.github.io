---
title: 算法之删除链表的倒数第N个节点
date: 2021-06-13 15:35:20
tags:
- 链表
- 算法
- 快慢指针
- Javascript
categories:
- 算法
---

19.给你一个链表，删除链表的倒数第 `n` 个结点，并且返回链表的头结点。

**进阶：**你能尝试使用一趟扫描实现吗？

![image-20210613153633327](D:\Blogs\NollieLeo.github.io\source\_posts\算法之删除链表的倒数第N个节点\image-20210613153633327.png)

思路：

双指针的经典应用，如果要删除倒数第n个节点，让fast移动n步，然后让fast和slow同时移动，直到fast指向链表末尾。删掉slow所指向的节点就可以了。

- 定义fast指针和slow指针，初始值为虚拟头结点，如图：

  ![image-20210613155602080](D:\Blogs\NollieLeo.github.io\source\_posts\算法之删除链表的倒数第N个节点\image-20210613155602080.png) 

-  fast首先走n + 1步 ，为什么是n+1呢，因为只有这样同时移动的时候slow才能指向删除节点的上一个节点（方便做删除操作），如图：

  ![image-20210613155614868](D:\Blogs\NollieLeo.github.io\source\_posts\算法之删除链表的倒数第N个节点\image-20210613155614868.png) 

-  fast和slow同时移动，之道fast指向末尾，如题：

  ![image-20210613155634908](D:\Blogs\NollieLeo.github.io\source\_posts\算法之删除链表的倒数第N个节点\image-20210613155634908.png)

-  删除slow指向的下一个节点，如图：

  ![image-20210613155643046](D:\Blogs\NollieLeo.github.io\source\_posts\算法之删除链表的倒数第N个节点\image-20210613155643046.png)



解题：

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function (head, n) {
    let preNode = new ListNode();
    preNode.next = head;
    let fast = preNode;
    let slow = preNode;
    while (n--) {
        fast = fast.next;
    }
    while (fast.next) {
        fast = fast.next;
        slow = slow.next;
    }
    slow.next = slow.next.next;
    return preNode.next;
};
```

