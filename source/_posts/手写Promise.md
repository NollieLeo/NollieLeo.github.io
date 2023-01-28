---
title: 手写Promise
date: 2021-06-13 13:20:58
tags:
- Javascript
- promise
- 面试题
categories:
- Javascript
---

暂未整理，先附上代码

```js
class _Promise {
constructor(excutor) {
  this.state = "pending";

  this.resolveInfo = undefined;
  this.rejectInfo = undefined;

  this.resolveCb = [];

  this.rejectCb = [];

  const resolve = (value) => {
    if (this.state === "pending") {
      this.state = "fullfilled";
      this.resolveInfo = value;
      this.resolveCb.forEach((fn) => {
        fn(this.resolveInfo);
      });
    }
  };
  const reject = (value) => {
    if (this.state === "pending") {
      this.state = "rejected";
      this.rejectInfo = value;
      this.rejectCb.forEach((fn) => {
        fn(this.rejectInfo);
      });
    }
  };
  try {
    excutor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}
then(onFullfilled, onRejected) {
  const innerPromise = new _Promise((resolve, reject) => {
    if (this.state === "fullfilled") {
      setTimeout(() => {
        try {
          const returnValue =
            typeof onFullfilled === "function"
              ? onFullfilled(this.resolveInfo)
              : (value) => value;
          _Promise.resolvePromise.apply(
            innerPromise,
            returnValue,
            resolve,
            reject
          );
        } catch (error) {
          reject(error);
        }
      }, 0);
    }
    if (this.state === "rejected") {
      setTimeout(() => {
        try {
          const returnValue =
            typeof onRejected === "function"
              ? onRejected(this.rejectInfo)
              : (value) => value;
          _Promise.resolvePromise.apply(
            innerPromise,
            returnValue,
            resolve,
            reject
          );
        } catch (error) {
          reject(error);
        }
      }, 0);
    }
    if (this.state === "pending") {
      this.resolveCb.push(() => {
        setTimeout(() => {
          try {
            const returnValue =
              typeof onFullfilled === "function"
                ? onFullfilled(this.resolveInfo)
                : (value) => value;
            _Promise.resolvePromise.apply(
              innerPromise,
              returnValue,
              resolve,
              reject
            );
          } catch (error) {
            reject(error);
          }
        }, 0);
      });
      this.rejectCb.push(() => {
        setTimeout(() => {
          try {
            const returnValue =
              typeof onRejected === "function"
                ? onRejected(this.rejectInfo)
                : (value) => value;
            _Promise.resolvePromise.apply(
              innerPromise,
              returnValue,
              resolve,
              reject
            );
          } catch (error) {
            reject(error);
          }
        }, 0);
      });
    }
  });
  return innerPromise;
}

static resolvePromise(newPromise, returnValue, resolve, reject) {
  if (newPromise === returnValue) {
    return reject(new Error("不能重复引用"));
  }
  // 防止多次调用
  let called;

  if (
    returnValue instanceof _Promise &&
    typeof returnValue.then === "function"
  ) {
    returnValue.then(
      (innerResolveMsg) => {
        if (called) return;
        called = true;
        resolvePromise(newPromise, innerResolveMsg, resolve, reject);
      },
      (innerRejectedMsg) => {
        if (called) return;
        called = true;
        resolvePromise(newPromise, innerRejectedMsg, resolve, reject);
      }
    );
  } else {
    resolve(returnValue);
  }
}
}



```

目前只实现了then方法，后续还有resolve,reject,catch, all, race, finally