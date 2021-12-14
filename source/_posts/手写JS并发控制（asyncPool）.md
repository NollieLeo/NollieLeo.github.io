---
title: 手写JS并发控制（asyncPool）
date: 2021-12-13 13:57:51
tags:
- Primise
- all
- race



---



## 并发控制

```js
// limiteNum: 并发数目
// tasks: 需要处理的任务列表
// iteraterFn: 完成的处理函数

// 并发控制任务
const ayncPool = async (limiteNum, tasks, iteraterFn) => {
  // 所有的任务队列
  const rect = [];
  // 正在进行的任务队列
  const pendingTasks = [];

  // 这里使用for of而不是用foreach的原因是
  // forEach await 时候并不会停止遍历
  for (const task of tasks) {
    // 这里对外层的结束处理函数包裹一层promise
    let promiseTask = Promise.resolve().then(() => iteraterFn(task, tasks));
    // rect去存储了promiseTask
    rect.push(promiseTask);

    if (limiteNum <= tasks.length) {
      const excutingTask = promiseTask.then(() => pendingTasks.splice(pendingTasks.indexOf(excutingTask), 1))
      pendingTasks.push(excutingTask)
      if (pendingTasks.length >= limiteNum) {
        // 这里去获取跑的最快的一个task
        await Promise.race(pendingTasks);
      }
    }
  }

  return Promise.all(rect)
}

const iterater = (i) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(i);
      console.log(i);
    }, i);
  })
}

ayncPool(2, [1000, 5000, 3000, 2000], iterater).then((data) => {
  console.log(data)
})
```

