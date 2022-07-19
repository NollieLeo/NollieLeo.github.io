#  typescript刷题记录

## 题目一 

**解决如下错误**

```ts
type User = {
    id: number;
    kind: string;
};
function makeCustomer<T extends User>(u: T): T {
  // Error（TS 编译器版本：v4.4.2）
  // Type '{ id: number; kind: string; }' is not assignable to type 'T'.
  // '{ id: number; kind: string; }' is assignable to the constraint of type 'T', 
  // but 'T' could be instantiated with a different subtype of constraint 'User'.
  return {
    id: u.id,
    kind: 'customer'
  }
}
```

因为T受User类型的约束，但是也有可能有其他情况，比如`{id:1, kind:'2',name:'test'}`，所以返回值中缺少了name

### 方法一

直接把剩余的u的key返回出去

```ts
type User = {
    id: number;
    kind: string;
};
function makeCustomer<T extends User>(u: T): T {
  return {
    ...u,
    id: u.id,
    kind: 'customer'
  }
}
```



### 方法二

```ts
function makeCustomer<T extends User>(u: T): ReturnMake<T, User> {
// Error（TS 编译器版本：v4.4.2）
// Type '{ id: number; kind: string; }' is not assignable to type 'T'.
// '{ id: number; kind: string; }' is assignable to the constraint of type 'T', 
// but 'T' could be instantiated with a different subtype of constraint 'User'.
    return {
        id: u.id,
        kind: 'customer'
    }
}

type ReturnMake<T extends User, U> = {
    [K in keyof R as K extends keyof T ? K: never]: U[K]
}
```

遍历 `User `中的 key ，并使用 `as` 断言，如果`K`（也就是 User 类型的 key），约束于 泛型类型的 key 就返回 `K`，否侧返回 `never`，`U[K]` 取键值。



## 题目二（考察函数重载）

本道题我们希望参数 a 和 b 的类型都是一致的，即 a 和 b 同时为 number 或 string 类型。当它们的类型不一致的值，TS 类型检查器能自动提示对应的错误信息。

```ts
function f(a: string | number, b: string | number) {
  if (typeof a === 'string') {
    return a + ':' + b; // no error but b can be number!
  } else {
    // error: 运算符“+”不能应用于类型“number”和“string | number”。ts(2365)
    return a + b; // error as b can be number | string
  }
}
```

### 解决方案：函数重载

```ts
function f(a:string, b:string ):string
function f(a:number, b:number):number;
function f(a: string | number, b: string | number) {
    if (typeof a === 'string' || typeof b === 'string') {
      return a + ':' + b; // no error but b can be number!
    } else {
      return a + b; // error as b can be number | string
    }
}
```





## 题目三（SetOptional || SetRequired）

如何定义一个 `SetOptional` 工具类型，支持把给定的`keys`对应的属性变成可选的？对应的使用示例如下所示：

```ts
type Foo = {
	a: number;
	b?: string;
	c: boolean;
}

// 测试用例
type SomeOptional = SetOptional<Foo, 'a' | 'b'>;

// type SomeOptional = {
// 	a?: number; // 该属性已变成可选的
// 	b?: string; // 保持不变
// 	c: boolean; 
// }

```

### 解决方法

```ts
type Foo = {
	a: number;
	b?: string;
	c: boolean;
}

// 测试用例
type SomeOptional = SetOptional<Foo, 'a' | 'b'>;

// type SomeOptional = {
// 	a?: number; // 该属性已变成可选的
// 	b?: string; // 保持不变
// 	c: boolean; 
// }

type SetOptional<T, R extends keyof T> = Omit<T,R> & Partial<Pick<T,R>>

```

> setRequried也是一样的如下

```ts
type SetRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
```



## 题目四（ConditionalPick）

`Pick<T, K extends keyof T>`的作用是将某个类型中的子属性挑出来，变成包含这个类型部分属性的子类型。

```typescript
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false
};

```

那么如何定义一个 `ConditionalPick`工具类型，支持根据指定的 Condition 条件来生成新的类型，对应的使用示例如下：

```typescript
interface Example {
	a: string;
	b: string | number;
	c: () => void;
	d: {};
}

// 测试用例：
type StringKeysOnly = ConditionalPick<Example, string>;
//=> {a: string}
```



### 解决方案

1、`in keyof`遍历 `V` 泛型；

2、通过类型断言判断 `V[K]` 对应键值是否约束于传入的 `string`如果是 `true `那么断言成返回遍历的当前 `K`，否则为 `never`。

返回 `never `在 TypeScript 编译器中，会默认认为这是个用不存在的类型，也相当于没有这个 `K `会被过滤，对应值则是 `V[K]` 获取。

```ts

interface Example {
	a: string;
	b: string | number;
	c: () => void;
	d: {};
}

// 测试用例：
type StringKeysOnly = ConditionalPick<Example, string>;
//=> {a: string}

type ConditionalPick<T,R> = {
    [K in keyof T as T[K] extends R ? K : never ]: T[K]
}

```



## 题目五（追加args）

定义一个工具类型 `AppendArgument`，为已有的函数类型增加指定类型的参数，新增的参数名是`x`，将作为新函数类型的第一个参数。具体的使用示例如下所示：

```typescript
type Fn = (a: number, b: string) => number
type AppendArgument<F, A> = // 你的实现代码

type FinalFn = AppendArgument<Fn, boolean> 
// (x: boolean, a: number, b: string) => number
```



### 解决方案1 （使用泛型工具）

使用泛型工具`Parameters`以及`ReturnType`

```ts
type Fn = (a: number, b: string) => number

type FinalFn = AppendArgument<Fn, boolean> 
// (x: boolean, a: number, b: string) => number

type AppendArgument<F extends (...args:any[]) => any, A> = (arg1:A , ...args2:Parameters<F>) => ReturnType<F> // 你的实现代码
```



### 解决方案2 （使用infer）

`infer`推导拿到参数类型`T`返回值类型为`R`，再从新返回一个新函数`arg1`参数为`A`，`...args`参数类型为前面推导保留的`T`，返回值即`R`。

```ts
type AppendArgument<F extends (...args:any[]) => any, A> = F extends (...args:infer T)=> infer R ? (agr1:A, ...args:T)=>R : never
```



## 题目五（数组类型拍平）

定义一个`NativeFlat`工具类型，支持把数组类型拍平（扁平化）。具体的使用示例如下所示：

```ts
type NaiveFlat<T extends any[]> = // 你的实现代码

// 测试用例：
type NaiveResult = NaiveFlat<[['a'], [['b', 'c']], ['d']]>
  
// NaiveResult的结果： "a" | "b" | "c" | "d"

```



### 解决方案（递归）

```ts
type NaiveFlat<T extends any[]> = T extends (infer R)[] ? (R extends any[] ? NaiveFlat<R>: R ): never// 你的实现代码

// 测试用例：
type NaiveResult = NaiveFlat<[['a'], [['b', 'c']], ['d']]>
  
// NaiveResult的结果： "a" | "b" | "c" | "d"
```

1、首先需要在约束条件中使用`infer`关键字推导出 `T` 传入的数组类型，并用 `P` 保存数组类型。

2、三元嵌套判断`R`类型是否约束于类型`any[]`如果还是是数组继续递归遍历调用`NaiveFlat<R>`并传入`R`，放 `R`类型不满足 `any[]`，返回最后的扁平完成`R`类型所以得到最终联合类型`"a" | "b" | "c" | "d"` 。



## 题目六 (数组不为空)

定义`NonEmptyArray`工具类型，用于确保数据非空数组。

```ts
type NonEmptyArray<T> = // 你的实现代码
const a: NonEmptyArray<string> = [] // 将出现编译错误
const b: NonEmptyArray<string> = ['Hello TS'] // 非空数据，正常使用
```

### 解决方案

```ts
const a: NonEmptyArray<string> = [] // 将出现编译错误
const b: NonEmptyArray<string> = ['Hello TS'] // 非空数据，正常使用

type NonEmptyArray<T> = [T, ...T[]]
```

`[T, ...T[]]`确保第一项一定是`T`，`[...T[]]`，为剩余数组类型。



## 题目七

定义一个`JoinStrArray`工具类型，用于根据指定的`Separator`分隔符，对字符串数组类型进行拼接。具体的使用示例如下所示：

```typescript
type JoinStrArray<Arr extends string[], Separator extends string> = // 你的实现代码

// 测试用例
type Names = ["Sem", "Lolo", "Kaquko"]
type NamesComma = JoinStrArray<Names, ","> // "Sem,Lolo,Kaquko"
type NamesSpace = JoinStrArray<Names, " "> // "Sem Lolo Kaquko"
type NamesStars = JoinStrArray<Names, "⭐️"> // "Sem⭐️Lolo⭐️Kaquko"
```

### 解决方法

```ts
// 测试用例
type Names = ["a", "b", "c"]
type NamesComma = JoinStrArray<Names, ","> // "Sem,Lolo,Kaquko"
type NamesSpace = JoinStrArray<Names, " "> // "Sem Lolo Kaquko"
type NamesStars = JoinStrArray<Names, "⭐️"> // "Sem⭐️Lolo⭐️Kaquko"

type JoinStrArray<Arr extends string[], Separator extends string> = Arr extends [infer A,...infer B] ? (`${A extends string ? A : ''}${B extends [string, ...string[]]
    ? `${Separator}${JoinStrArray<B, Separator>}`
    : ''}`):'' // 你的实现代码

```

`JoinStrArray`工具方法，`Arr`泛型必须约束于`string[]`类型，`Separator`为分隔符，也必须约束于`string`类型；

1、首先`Arr`约束于后面`[infer A, ...infer B]`并通过`infer`关键字推导拿到第一个索引`A`的类型，以及剩余（rest）数组的类型为`B`；

2、如果满足约束，则连接字符，连接字符使用模板变量，先判断`A`（也就是第一个索引）是否约束于`string`类型，满足就取第一个`A`否则直接返回空字符串；

3、后面连接的`B`（...rest）判断是否满足于`[string, ...string[]]`，意思就是是不是还有多个索引。如果有，用分割符号，加上递归再调用`JoinStrArray`工具类型方法，`Arr`泛型就再为 B ，分隔符泛型`Separator`不变。减治思想，拿出数组的每一项，直至数组为空。

最开始的话，如果`Arr`不满足约束，那么直接返回为空字符串。

## 题目八

实现一个`Trim`工具类型，用于对字符串字面量类型进行去空格处理。具体的使用示例如下所示：

```ts
type Trim<V extends string> = // 你的实现代码

// 测试用例
Trim<' semlinker '>
//=> 'semlinker'
```

### 解决方案

```ts
type TrimLeft<V extends string> = V extends ` ${infer R}` ? TrimLeft<R> : V;
type TrimRight<V extends string> = V extends `${infer R} ` ? TrimRight<R> : V;

type Trim<V extends string> = TrimLeft<TrimRight<V>>;

// 测试用例
type Result = Trim<' semlinker '>
//=> 'semlinker'
```



## 题目九

实现一个`IsEqual`工具类型，用于比较两个类型是否相等。具体的使用示例如下所示：

```typescript
type IsEqual<A, B> = // 你的实现代码

// 测试用例
type E0 = IsEqual<1, 2>; // false
type E1 = IsEqual<{ a: 1 }, { a: 1 }> // true
type E2 = IsEqual<[1], []>; // false
```

### 解决方案

```ts
// 测试用例
type E0 = IsEqual<1, 2>; // false
type E1 = IsEqual<{ a: 1 }, { a: 1 }> // true
type E2 = IsEqual<[1], []>; // false
type IsEqual<A, B> = [A] extends [B]? ([B] extends [A]? true:false ): false // 你的实现代码
```



## 题目十

> 以下两者都是相类似的类型推倒

实现一个获取数组第一个位置的类型 `HEAD`

```ts
// 测试用例
type H0 = Head<[]> // never
type H1 = Head<[1]> // 1
type H2 = Head<[3, 2]> // 3
type Head<T extends Array<any>> =  T extends [infer A, ...infer B] ? A :never// 你的实现代码
```

实现一个获取数组最后一个位置的类型`TAIL`

```ts
// 测试用例
type T0 = Tail<[]> // []
type T1 = Tail<[1, 2]> // [2]
type T2 = Tail<[1, 2, 3, 4, 5]> // [2, 3, 4, 5]
type Tail<T extends Array<any>> = T extends [...any, infer A] ? A  : never  // 你的实现代码

```



## 题目十一

实现一个`Unshift`工具类型，用于把指定类型`E`作为第一个元素添加到 T 数组类型中。具体的使用示例如下所示：

```typescript
type Unshift<T extends any[], E> =  // 你的实现代码

// 测试用例
type Arr0 = Unshift<[], 1>; // [1]
type Arr1 = Unshift<[1, 2, 3], 0>; // [0, 1, 2, 3]
复制代码
```

### 实现方法

```typescript
type Unshift<T extends any[], E> = [E, ...T];

// 测试用例
type Arr0 = Unshift<[], never>; // [1]
type Arr1 = Unshift<[1, 2, 3], 0>; // [0, 1, 2, 3]
复制代码
```

新建一个数组，第一项类型为`E`，剩余使用`...T`连接。





## 题目十二

实现一个`Shift`工具类型，用于移除`T`数组类型中的第一个类型。具体的使用示例如下所示：

```typescript
type Shift<T extends any[]> = // 你的实现代码

// 测试用例
type S0 = Shift<[1, 2, 3]> 
type S1 = Shift<[string,number,boolean]> 

```

### 实现方案

```ts
// 测试用例
type S0 = Shift<[1, 2, 3]> 
type S1 = Shift<[string,number,boolean]> 
type Shift<T extends any[]> = T extends [infer A, ...infer B] ? B : []  // 你的实现代码
```

`...infer B`去除第一项之后的集合，使用变量`B`保存该类型。如果满足约束，返回剩余参数类型，也就是`B`。



## 题目十三

实现一个`Push`工具类型，用于把指定类型`E`作为第最后一个元素添加到`T`数组类型中。具体的使用示例如下所示：

```ts
type Push<T extends any[], V> = // 你的实现代码

// 测试用例
type Arr0 = Push<[], 1> // [1]
type Arr1 = Push<[1, 2, 3], 4> // [1, 2, 3, 4]
```

### 解决方案

```ts
// 测试用例
type Arr0 = Push<[], 1> // [1]
type Arr1 = Push<[1, 2, 3], 4> // [1, 2, 3, 4]
type Push<T extends any[], E> = [...T, E]  // 你的实现代码
```



## 题目十四

实现一个`Includes`工具类型，用于判断指定的类型`E`是否包含在`T`数组类型中。具体的使用示例如下所示：

```ts
type Includes<T extends Array<any>, E> = // 你的实现代码
type I0 = Includes<[], 1> // false
type I1 = Includes<[2, 2, 3, 1], 2> // true
type I2 = Includes<[2, 3, 3, 1], 1> // true
```

### 解决方法

```ts
type I0 = Includes<[], 1> // false
type I1 = Includes<[2, 2, 3, 1], 2> // true
type I2 = Includes<[2, 3, 3, 1], 1> // true

type Includes<T extends Array<any>, E> =  E extends T[number] ? true :false
```

这里`T[number]`可以理解返回`T`数组元素的类型，比如传入的泛型`T`为`[2, 2, 3, 1]`，那么`T[number]`被解析为：`2 | 2 | 3 | 1`。



## *题目十五

实现一个`UnionToIntersection`工具类型，用于把联合类型转换为交叉类型。具体的使用示例如下所示：

```typescript
type UnionToIntersection<U> = // 你的实现代码

// 测试用例
type U0 = UnionToIntersection<string | number> // never
type U1 = UnionToIntersection<{ name: string } | { age: number }> // { name: string; } & { age: number; }
```

### 解决方案

```ts
// 测试用例
type U0 = UnionToIntersection<string | number> // never
type U1 = UnionToIntersection<{ name: string } | { age: number }> // { name: string; } & { age: number; }

type UnionToIntersection<U> = (
    U extends unknown ? (props: U)=>void : never
) extends (props2: infer P) => void ? P : never
```

1、`extends unknown`始终为true，默认进入到分发情况

2、会声明一个以`U`为入参类型的函数类型`A`，即`(props: U) => void`，该函数约束于以`props2`类型为入参的函数类型`B`，即`(props2: infer P) => void`。

3、如果函数`A`能继承函数`B`则 返回`infer P`声明的`P`，否则返回`never`，再利用**函数参数类型逆变**，从而实现得到的结果从联合类型到交叉类型的转变。

这里是也设计到一个知识点：**分布式条件类型，**条件类型的特性：分布式条件类型。在结合联合类型使用时（**只针对\**\*\*extends\*\**\*左边的联合类型**），分布式条件类型会被自动分发成联合类型。例如，`T extends U ? X : Y`，`T`的类型为`A | B | C`，会被解析为`(A extends U ? X : Y) | (B extends U ? X : Y) | (C extends U ? X : Y)`。

都知道`infer`声明都是只能出现在`extends`子语句中。但是，在协变的位置上，同一类型变量的多个候选类型会被推断为联合类型：

```typescript
type Foo<T> = T extends { a: infer U, b: infer U } ? U : never;
type T10 = Foo<{ a: string, b: string }>;  // string
type T11 = Foo<{ a: string, b: number }>;  // string | number
```

在逆变的位置上，同一个类型多个候选类型会被推断为交叉类型：

```typescript
type Bar<T> = T extends { a: (x: infer U) => void, b: (x: infer U) => void } ? U : never;
type T20 = Bar<{ a: (x: string) => void, b: (x: string) => void }>;  // string
type T21 = Bar<{ a: (x: string) => void, b: (x: number) => void }>;  // string & number
```





## 题目十六（元组转化为对象）





# ts内置方法实现

## Exclude **排除类型**

例子：

```ts
type Dir='1'|'2'|'3'|'4'

// type dir1 = "3" | "4"
type dir1=Exclude<Dir,'1'|'2'>
```

实现：

```ts
type MyExclude<T, R> = T extends R ? never :T
```



## Pick **获取 key 类型**

```ts
type MyPick<T, R extends keyof T> = {
    [Key in R]: T[Key]
}
```



## Omit **排除 key 类型**

```ts
type MyOmit<T, R extends keyof T> = MyPick<T, MyExclude<keyof T, R>>
```



## Readonly 属性只读

```ts
type MyReadonly<T> = {
    readonly [Key in keyof T]: T[Key]
}
```



## Required 属性必选

```ts
type MyRequired<T> = {
    [Key in keyof T]-?:T[Key]
}
```



## Partial 属性可选

```ts
type MyPartial<T> = {
    [Key in keyof T]?: T[Key]
}
```



## ReturnType 获取函数返回类型

```ts
type MyReturnType<T extends (...args:any[])=>any> = T extends (...args:any[]) => infer R ? R :never
```



## Parameters 获取函数参数类型

```ts
type MyParameters<T extends (...args:any[])=>any> = T extends (...args:infer B) => any? B:never
```



# ts 实用范型工具

## OptionalRequired 部分属性必选

### 实现一

```ts
/*
 * @Description: 部分属性必选
 */

export type OptionalRequired<T,R extends keyof T> = {
    [key in R]-?: T[key]
} & {
    [key in Exclude<keyof T, R>]: T[key]
}

type TestObj = {
    a?:string,
    b:number,
    c?:object
}

type OptionRequiredObjType = OptionalRequired<TestObj,'a' | 'c'>

```

### 实现二

```ts
export type OptionRequired<T,R extends keyof T> = Required<T> & Omit<T, R>
```



## OptionalReadonly 部分属性只读

### 实现一

```ts
/*
 * @Description: 部分属性只读
 */
export type OptionalReadonly<T,R extends keyof T> = {
    readonly [key in R]: T[key]
} & {
    [key in Exclude<keyof T, R>]: T[key]
}

type TestObj = {
    a?:string,
    b:number,
    c?:object
}

type OptionReadonlyObjType = OptionalReadonly<TestObj,'a' | 'c'>
```

### 实现二

```ts
export type OptionalReadonly<T,R extends keyof T> = Omit<T,R> & Readonly<Pick<T,R>>
```



## OptionalPartial 部分属性可选

### 实现一

```ts
/*
 * @Description: 部分可选
 */

type OptionalPartial<T, R extends keyof T> = {
    [key in R]?: T[key]
} & {
    [key in Exclude<keyof T, R>]: T[key]
}

type TestObj = {
    a:string,
    b:number,
    c:object
}

type OptionPartialObjType = OptionalPartial<TestObj,'a' | 'c'>
```



### 实现二

```ts
type OptionalPartial<T, R extends keyof T> =  Omit<T, R> & Partial<Pick<T,R>>;
```



