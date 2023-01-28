---
title: ts之协变和逆变
date: 2022-06-05 16:53:07
tags:
- Typescript
- 协变和逆变
category:
- Typescript
---



# 协变和逆变

协变和逆变是编程理论中一个很重要的话题。用于表达父类子类在安全类型转换后的兼容性（或者说继承关系）。定义为：如果`A`，`B`代表两个类型；`f()`表示类型转换；`A -> B`表示`A`是`B`的子类。

- 当`f()`是协变时：若 `A -> B`，则`f(A) -> f(B)`
- 当`f()`是逆变时：若 `A -> B`，则`f(B) -> f(A)`
- 当`f()`是双变时：若 `A -> B`，则以上均成立
- 当`f()`是不变时：若 `A -> B`，则以上均不成立，没有兼容关系

```ts
class Animal {
  move(){
    console.log("animal is moving");
  }
}

class Cat extends Animal {
  purr() {
    console.log("cat is purring");
  }
}

class WhiteCat extends Cat {
  showoffColor() {
    console.log("see my hair color");
  }
}
```

我们有名为`Animial`的父类，`Cat`是`Animal`的子类。`WhiteCat`是`Cat`的子类， 即`WhiteCat -> Cat -> Animal`。根据父类兼容子类的原则可知：

```ts
let animal: Animal;
let cat: Cat;
let whiteCat: WhiteCat;

animal = cat;
animal = whiteCat;
cat = whiteCat;
```

## 抛出问题

假如现在有一个函数，类型为`(param: Cat) => Cat`。那么它的兼容类型是什么呢？

我们可以把这个问题分解成两个部分参数兼容性和返回值兼容性。

- `(param: Cat) => void`的兼容类型是什么？
- `() => Cat`的兼容类型是什么？

## 参数兼容性

我们假设`(param: Cat) => void`为`A`，此时有以下两种函数：

- `B`: `(param: WhiteCat) => void`
- `C`：`(param: Animal) => void`

那么`A`兼容哪一个函数？

### 假设兼容B

那么此时 `A = B`成立：

```ts
let A: (param: Cat) => void;
const B = (param: WhiteCat) => {
  param.move();
  param.purr();
  param.showoffColor();
};

A = B;
A(new Cat());

```

函数运行到`param.showoffColor()`会报错。那么假设不成立。

### 假设兼容C

那么此时 `A = C`成立：

```ts
let A: (param: Cat) => void;
const C = (param: Animal) => {
  param.move();
};

A = C;
A(new Cat());

```

此时函数成功运行。那么假设成立。

所以`(param: Animal) => void -> (param: Cat) => void` 。根据前面的定义可以看出函数参数是逆变的。

## 返回值兼容性

我们假设`() => Cat`为`A`，此时有以下两种函数：

- `B`: `() => Animal`
- `C`：`() => WhiteCat`

那么`A`兼容哪一个函数？

### 假设兼容B

那么此时 `A = B`成立：

```ts
let A: () => Cat;
const B = () => new Animal();

A = B;
const result = A();
result.move();
result.purr();

```

函数运行到`result.purr()`会报错。那么假设不成立。

### 假设兼容C

那么此时 `A = C`成立：

```ts
let A: () => Cat;
const C = () => new WhiteCat();

A = C;
const result = A();
result.move();
result.purr();

```

此时函数成功运行。那么假设成立。

所以`() => WhiteCat -> () => Cat`。根据前面的定义可以看出函数返回值是协变的。



## 函数参数类型的现实

在ts中，参数类型是双变的，也就是说既是协变，也是逆变。这当然不安全。所以我们可以通过开启`strictFunctionTypes`修复这个问题，保证参数类型是逆变。

那么为什么ts会让函数参数类型保留双变转换呢？下面是一个十分常见的例子：

```typescript
interface Event { timestamp: number; }
interface MouseEvent extends Event { x: number; y: number }

function listenEvent(eventType: EventType, handler: (n: Event) => void) {
    /* ... */
}

// 虽然不安全，且编译无法通过，但是十分常见的使用方式
listenEvent(EventType.Mouse, (e: MouseEvent) => console.log(e.x, e.y));

// 为了保证编译通过，只能通过以下方式
listenEvent(EventType.Mouse, (e: Event) => console.log((e as MouseEvent).x, (e as MouseEvent).y));
listenEvent(EventType.Mouse, ((e: MouseEvent) => console.log(e.x, e.y)) as (e: Event) => void);

```

而如果函数参数类型是双变，那么上面第一种形式的代码也能顺利通过编译，无需使用后两种绕路的方式。

