---
title: typeScript总结
date: 2020-08-02 22:44:13
tags:
- ts
categories:
- ts
---

## ts中需要理解的
###  - any vs unknown

`any` 表示任意类型，这个类型会逃离 `Typescript` 的类型检查，和在 `Javascript` 中一样，`any` 类型的变量可以执行任意操作，编译时不会报错。 `unknown` 也可以表示任意类型，但它同时也告诉 `Typescript` 开发者对其也是一无所知，做任何操作时需要慎重。这个类型仅可以执行有限的操作（`==、=== 、||、&&、?、!、typeof、instanceof` 等等），其他操作需要向 `Typescript` 证明这个值是什么类型，否则会提示异常。

```tsx
let foo: any
let bar: unknown

foo.functionNotExist()
bar.functionNotExist() // 对象的类型为 "unknown"。

if (!!bar) { // ==、=== 、||、&&、?、!、typeof、instanceof
  console.log(bar)
}

bar.toFixed(1) // Error

if (typeof bar=== 'number') {
  bar.toFixed(1) // OK
}

```

`any` 会增加了运行时出错的风险，不到万不得已不要使用。表示【不知道什么类型】的场景下使用 `unknown`。

###  - {} vs object vs Object

`object` 表示的是常规的 `Javascript` 对象类型，非基础数据类型。

```ts
declare function create(o: object): void;

create({ prop: 0 }); // OK
create(null); // Error
create(undefined); // Error
create(42); // Error
create("string"); // Error
create(false); // Error
create({
  toString() {
    return 3;
  },
}); // OK

```

`{}` 表示的非 null，非 undefined 的任意类型。

```ts
declare function create(o: {}): void;

create({ prop: 0 }); // OK
create(null); // Error
create(undefined); // Error
create(42); // OK
create("string"); // OK
create(false); // OK
create({
  toString() {
    return 3;
  },
}); // OK

```

`Object` 和 `{}` 几乎一致，区别是 `Object` 类型会对 `Object` 原型内置的方法（`toString/hasOwnPreperty`）进行校验。

```ts
declare function create(o: Object): void;

create({ prop: 0 }); // OK
create(null); // Error
create(undefined); // Error
create(42); // OK
create("string"); // OK
create(false); // OK
create({
  toString() {
    return 3;
  },
}); // Error

```

### - Never 类型

`never` 类型表示的是那些永不存在的值的类型。 例如，`never` 类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型。

```tsx
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

```

在 TypeScript 中，可以利用 never 类型的特性来实现全面性检查，具体示例如下：

```tsx
type Foo = string | number;

function controlFlowAnalysisWithNever(foo: Foo) {
  if (typeof foo === "string") {
    // 这里 foo 被收窄为 string 类型
  } else if (typeof foo === "number") {
    // 这里 foo 被收窄为 number 类型
  } else {
    // foo 在这里是 never
    const check: never = foo;
  }
}

```

注意在 else 分支里面，我们把收窄为 never 的 foo 赋值给一个显示声明的 never 变量。如果一切逻辑正确，那么这里应该能够编译通过。但是假如后来有一天你的同事修改了 Foo 的类型：

```tsx
type Foo = string | number | boolean;

```

 然而他忘记同时修改 `controlFlowAnalysisWithNever` 方法中的控制流程，这时候 else 分支的 foo 类型会被收窄为 `boolean` 类型，导致无法赋值给 never 类型，这时就会产生一个编译错误。通过这个方式，我们可以确保`controlFlowAnalysisWithNever` 方法总是穷尽了 Foo 的所有可能类型。 通过这个示例，我们可以得出一个结论：**使用 never 避免出现新增了联合类型没有对应的实现，目的就是写出类型绝对安全的代码。** 



###  - type vs interface

两者都可以用来定义类型。

`interface`（接口） 只能声明对象类型，支持声明合并（可扩展）。

```ts
interface User {
  id: string
}
 
interface User {
  name: string
}
 
const user = {} as User
 
console.log(user.id);
console.log(user.name);

```

`type`（类型别名）不支持声明合并、行为有点像`const`, `let` 有块级作用域。

```ts
type User = {
  id: string,
}

if (true) {
  type User = {
    name: string,
  }

  const user = {} as User;
  console.log(user.name);
  console.log(user.id) // 类型“User”上不存在属性“id”。
}

```

`type` 更为通用，右侧可以是任意类型，包括表达式运算，以及映射类型等等。

```ts
type A = number
type B = A | string
type ValueOf<T> = T[keyof T];
```

如果你是在开发一个包，模块，允许别人进行扩展就用 `interface`，如果需要定义基础数据类型或者需要类型运算，使用 `type`。

###  - enum vs const enum

默认情况下 `enum` 会被编译成 `Javascript` 对象，并且可以通过 `value` 反向查找。

```ts
enum ActiveType {
  active = 1,
  inactive = 2,
}

function isActive(type: ActiveType) {}
isActive(ActiveType.active);

// ============================== compile result:
// var ActiveType;
// (function (ActiveType) {
//     ActiveType[ActiveType["active"] = 1] = "active";
//     ActiveType[ActiveType["inactive"] = 2] = "inactive";
// })(ActiveType || (ActiveType = {}));
// function isActive(type) { }
// isActive(ActiveType.active);

ActiveType[1]; // OK
ActiveType[10]; // OK！！！

```

`cosnt enum` 默认情况下不会生成 `Javascript` 对象而是把使用到的代码直接输出 `value`，不支持 `value` 反向查找。

```ts
const enum ActiveType {
  active = 1,
  inactive = 2,
}

function isActive(type: ActiveType) {}
isActive(ActiveType.active);

// ============================== compile result:
// function isActive(type) { }
// isActive(1 /* active */);

ActiveType[1]; // Error
ActiveType[10]; // Error

```


## 类型运算

### 集合运算

`&` 在 JS 中表示位与运算符，在 Typescript 中用来计算两个类型的交集。

```ts
type Type1 = "a" | "b";
type Type2 = "b" | "c";
type Type3 = Type1 & Type2; // 'b'
```

`|` 在 JS 中表示位或运算符，在 Typescript 中用来计算两个类型的并集。

```ts
type Type1 = "a" | "b";
type Type2 = "b" | "c";
type Type3 = Type1 | Type2; // 'a' 'b' 'c'

```

### 索引签名

索引签名可以用来定义对象内的属性、值的类型，例如定义一个 `React` 组件，允许 `Props` 可以传任意 `key` 为 `string`，`value` 为 `number` 的 `props`。

```tsx
interface Props {
  [key: string]: number
}

<Component count={1} /> // OK
<Component count={true} /> // Error
<Component count={'1'} /> // Error

```

### 类型键入

类型键入允许 `Typescript` 像对象取属性值一样使用类型。

```tsx
type User = {
  userId: string
  friendList: {
    fristName: string
    lastName: string
  }[]
}

type UserIdType = User['userId'] // string
type FriendList = User['friendList'] // { fristName: string; lastName: string; }[]
type Friend = FriendList[number] // { fristName: string; lastName: string; }

```

在上面的例子中，我们利用类型键入的功能从 `User` 类型中计算出了其他的几种类型。`FriendList[number]` 这里的 `number` 是关键字，用来取数组子项的类型。在元组中也可以使用字面量数字得到数组元素的类型。

```tsx
type Tuple = [number, string]
type First = Tuple[0] // number
type Second = Tuple[1] // string
```



#### typeof value

`typeof` 关键字在 JS 中用来获取变量的类型，运算结果是一个字符串（值）。而在 TS 中表示的是推算一个变量的类型（类型）

```tsx
let str1 = 'fooooo'
type Type1 = typeof str1 // type string

const str2 = 'fooooo'
type Type2 = typeof str2 // type "fooooo"

```

`typeof` 在计算变量和常量时有所不同，由于常量时不会变的，所以 `Typescript` 会使用严格的类型，例如下面 `Type2` 的例子，`str2` 的是个 'fooooo' 类型的字符串。而变量会是宽松的字符串类型。

#### keyof Type

`keyof` 关键字可以用来获取一个对象类型的所有 `key` 类型。

```ts
type User = {
  id: string;
  name: string;
};

type UserKeys = keyof User; //"id" | "name"

```

`enum` 在 Typescript 中有一定的特殊性（有时表示类型，又是表示值），如果要获取 `enum` 的 key 类型，需要先把它当成值，用 `typeof` 再用 `keyof`。

```tsx
enum ActiveType {
  Active,
  Inactive
}

type KeyOfType = keyof typeof ActiveType // "Active" | "Inactive"

```

#### extends

`extends` 关键字同样存在多种用途，在 `interface` 中表示类型扩展，在条件类型语句中表示布尔运算，在泛型中起到限制的作用，在 `class` 中表示继承。

```tsx
// 表示类型扩展
interface A {
  a: string
}

interface B extends A { // { a: string, b: string }
  b: string
}

// 条件类型中起到布尔运算的功能
type Bar<T> = T extends string ? 'string' : never
type C = Bar<number> // never
type D = Bar<string> // string
type E = Bar<'fooo'> // string

// 起到类型限制的作用
type Foo<T extends object> = T
type F = Foo<number> // 类型“number”不满足约束“object”。
type G = Foo<string> // 类型“string”不满足约束“object”。
type H = Foo<{}> // OK

// 类继承
class I {}
class J extends I {}

```

## 泛型

假设 `filter` 方法传入一个数字类型的数组，及一个返回布尔值的方法，最终过滤出想要的结果返回，声明大致如下。

```tsx
declare function filter(
  array: number[],
  fn: (item: unknown) => boolean
): number[];

```

过了一段时间，需要使用 `filter` 方法来过滤一些字符串，可以使用 `Typescript` 的函数重载的功能，filter 内部代码不变，只需要添加类型定义。

```tsx
declare function filter(
  array: string[],
  fn: (item: unknown) => boolean
): string[];

declare function filter(
  array: number[],
  fn: (item: unknown) => boolean
): number[];

```

又过了一段时间，需要用 `filter` 来过滤 `boolean[]`, 过滤 `object[]`, 过滤其他具体类型，如果仍然使用重载的方法将会出现非常多重复的代码。这时候就可以考虑使用泛型了，`Dont repeat yourself`。

泛型就像 `Typescript` “语言” 中的“方法”，可以通过“传参”来得到新的类型。日常开发中经常用到的泛型有 `Promise、Array、React.Component` 等等。



使用泛型来改造 `filter` 方法:

```ts
declare function filter<T>(
  array: T[],
  fn: (item: unknown) => boolean
): T[];

```



只需要在方法名后面加上尖括号`<T>`，表示方法支持一个泛型参数，(这里的 T 可以改为任意你喜欢的变量名，大部分人的偏好是从 T、U、V...开始命名)，`array: T[]` 表示传入的第一个参数是泛型模板类型的数组，`:T[]` 表示方法会返回模板类型的数组。`Typescript` 将会自动根据传参类型辨别出 `T` 实际代表的类型，这样就可以保留类型的同时，避免重复代码了

```ts
filter([1, 2, 3], () => true) // function filter<number>(array: number[], fn: (item: unknown) => boolean): number[]
filter(['1', '2', '3'], () => true) // function filter<string>(array: string[], fn: (item: unknown) => boolean): string[]

```

把泛型比喻成“方法”之后，很多行为都很好理解。“方法”可以传参，可以有多个参数，可以有默认值，泛型也可以。

```tsx
type Foo<T, U = string> = { // 多参数、默认值
  foo: Array<T> // 可以传递
  bar: U
}

type A = Foo<number> // type A = { foo: number[]; bar: string; }
type B = Foo<number, number> // type B = { foo: number[]; bar: number; }

```



别忘了，泛型参数还可以有限制，例如下面的例子 `extends` 的作用是限制 `T` 至少是个 `HTMLElement` 类型。

```tsx
type MyEvent<T extends HTMLElement = HTMLElement> = {
   target: T,
   type: string
}

```

### 映射类型

#### 关键字 in

`in` 关键字在类型中表示类型映射，和索引签名的写法有些相似。下面的例子中声明一个 `Props` 的类型，`key` 类型为 'count' | 'id' 类型，`value` 为 `number` 类型。

```tsx
type Props = {
  [key in 'count' | 'id']: number
}

const props1: Props = { // OK
  count: 1,
  id: 1
}

const props2: Props = {
  count: '1', // ERROR
  id: 1
}

const props3: Props = {
  count: 1,
  id: 1,
  name: 1 // ERROR
}

```

#### Record

`Record` 定义键类型为 `Keys`、值类型为 `Values` 的对象类型。

 示例 :

```tsx
enum ErrorCodes {
  Timeout = 10001,
  ServerBusy = 10002,
  
}

const ErrorMessageMap: Record<ErrorCodes, string> = {
  [ErrorCodes.Timeout]: 'Timeout, please try again',
  [ErrorCodes.ServerBusy]: 'Server is busy now'
}

```

类型映射还可以用来做全面性检查，例如上面的例子中如果漏了某个 ErrorCodes，Typescript 同样会抛出异常。

```tsx
enum ErrorCodes {
  Timeout = 10001,
  ServerBusy = 10002,
  AuthFailed = 10003
}

// 类型 "{ 10001: string; 10002: string; }" 中缺少属性 "10003"，但类型 "Record<ErrorCodes, string>" 中需要该属性
const ErrorMessageMap: Record<ErrorCodes, string> = { 
  [ErrorCodes.Timeout]: 'Timeout, please try again',
  [ErrorCodes.ServerBusy]: 'Server is busy now'
}

```

代码实现：

```tsx
type Record<K extends keyof any, T> = {
  [P in K]: T;
};
```

#### 	Partial

`Partial` 可以将类型定义的属性变成可选。

示例：

```tsx
type User = {
  id?: string,
  gender: 'male' | 'female'
}

type PartialUser =  Partial<User>  // { id?: string, gender?: 'male' | 'female'}

function createUser (user: PartialUser = { gender: 'male' }) {}

```



`User` 类型对于 `gender` 属性是要求必须有的(: 用户必须有性别才行。而在设计 `createUser` 方法时，为了方便程序会给 `gender` 赋予默认值。这时候可以将参数修改成 `Partial`，使用者就可以不用必须传 `gender` 了。

代码实现：

```tsx
type Partial<T> = {
  [U in keyof T]?: T[U];
};

```

#### Required

`Required` 和 `Partial` 的作用相反，是将对象类型的属性都变成必须。

示例：

```tsx
type User = {
  id?: string,
  gender: 'male' | 'female'
}

type RequiredUser = Required<User> // { readonly id: string, readonly gender: 'male' | 'female'}

function showUserProfile (user: RequiredUser) {
  console.log(user.id) // 不需要加 ！
  console.log(user.gender)
}

```

任然使用 `User` 类型，`id` 属性定义的时候是可选的（要创建了才有 `id`），而展示的时候 `User id` 肯定已经存在了，这时候可以使用 `Required`，那么调用 `showUserProfile` 时 `User` 所有属性都必须非 `undefined`。

代码实现：

```tsx
type Required<T> = {
  [U in keyof T]-?: T[U];
};

```

`-?` 符号在这里表示的意思是去掉可选符号 `?`。



#### Readonly

`Readonly` 是将对象类型的属性都变成只读。

示例：

```tsx
type ReadonlyUser = Readonly<User> // { readonly id?: string, readonly gender: 'male' | 'female'}

const user: ReadonlyUser = {
  id: '1',
  gender: 'male'
}

user.gender = 'femail' // 无法分配到 "gender" ，因为它是只读属性。

```

代码实现：

```tsx
type Readonly<T> = {
  readonly [U in keyof T]: T[U];
};

```

#### Pick

Pick 是挑选类型中的部分属性。

示例：

```tsx
type Location = {
  latitude: number
  longitude: number
  city: string
  address: string
  province: string
  district: string
}

type LatLong = Pick<Location, 'latitude' | 'longitude'> //  { latitude: number; longitude: number; }

const region: LatLong = {
  latitude: 22.545001,
  longitude: 114.011712
}

```

代码实现：

```tsx
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

```

#### Omit

`Omit` 结合了 `Pick` 和 `Exclude`，将忽略对象类型中的部分 keys。

示例：

```tsx
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Omit<Todo, "description">; // { title: string; completed: boolean; }

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};

```

代码实现：

```tsx
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

```



### 条件类型

#### 三目运算符

`Typescript` 类型运算也支持“三目运算符”，称之为条件类型，一般通过 `extends` 关键字判断条件成不成立，成立的话得到一个类型，不成立的话返回另一个类型。条件类型通常是与泛型同时出现的（：因为如果是已知固定类型就没必要再判断了。

```tsx
type IsString<T> = T extends string ? true : false

type A = IsString<number> // false
type B = IsString<string> // true

```

在处理并集时，条件类型还具有条件分配的逻辑，`number | string` 做条件运算等价于 `number 条件运算 | string` 条件运算

```tsx
type ToArray<T> = T[]
type A = ToArray<number | string> // (string | number)[]

type ToArray2<T> = T extends unknown ? T[] : T[];
type B = ToArray2<number | string>; // string[] | number[]

```

#### infer

除了显示声明泛型参数，`Typescript` 还支持动态推导泛型，用到的是 `infer` 关键字。什么场景下还需要动态推导？通常是需要通过传入的泛型参数去获取新的类型，这和直接定义一个新的泛型参数不一样。

例如现在定义了 `ApiResponse` 的两个具体类型 `UserResponse` 和 `EventResponse`，如果想得到 `User` 实体类型和 `Event` 实体类型需要怎么做？

```tsx
type ApiResponse<T> = {
  code: number
  data: T
};

type UserResponse = ApiResponse<{
  id: string,
  name: string
}>

type EventResponse = ApiResponse<{
  id: string,
  title: string
}>

```

当然可以拎出来单独定义新的类型。

```tsx
type User = {
  id: string,
  name: string
}

type UserResponse = ApiResponse<User>

```

但如果类型是由其他人提供的就不好处理了。这时可以尝试下使用 `infer`，代码如下：

```tsx
type ApiResponseEntity<T> = T extends ApiResponse<infer U> ? U : never;

type User = ApiResponseEntity<UserResponse>; // { id: string; name: string; }
type Event = ApiResponseEntity<EventResponse>; // { id: string; title: string; }

```

示例中，判断传入的类型 `T` 是不是 `T extends ApiResponse` 的子集，这里的 `infer` 既是让 `Typescript` 尝试去理解 `T` 具体是那种类型的 `ApiResponse`，生成新的泛型参数 `U`。如果满足 `extends` 条件则将 `U` 类型返回。

充分理解了条件类型和 `infer`关键字之后，`Typescript` 自带的条件泛型工具也就很好理解了。

#### ReturnType

`Returntype` 用来获取方法的返回值类型

示例：

```tsx
type A = (a: number) => string
type B = ReturnType<A> // string

```

代码实现：

```tsx
type ReturnType<T> = T extends (
  ...args: any[]
) => infer R ? R : any;

```



#### Parameters

`Parameters` 用来获取方法的参数类型

示例：

```tsx
type EventListenerParamsType = Parameters<typeof window.addEventListener>;
// [type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined]

```

代码实现：

```tsx
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any
  ? P : never;

```



#### Exclude

`Exclude` 用来计算在 T 中而不在 U 中的类型

示例：

```tsx
type A = number | string
type B = string
type C = Exclude<A, B> // number
	
```

代码实现：

```tsx
type Exclude<T, U> = T extends U ? never : T;

```



#### Extract

`Extract` 用来计算 T 中可以赋值给 U 的类型

示例：

```tsx
type A = number | string
type B = string
type C = Extract<A, B> // string

```

代码实现：

```tsx
type Extract<T, U> = T extends U ? T : never;
```



#### NonNullable

从类型中排除 `null` 和 `undefined`

示例：

```tsx
type A = {
  a?: number | null
}
type B = NonNullable(A['a']) // number

```

代码实现：

```tsx
type NonNullable<T> = T extends null | undefined ? never : T;
```



## Event事件对象类型

常用的Event事件对象类型

- `ClipboardEvent<T =Element>` 剪贴板事件对象

- `DragEvent<T =Element>` 拖拽事件对象

- `ChangeEvent<T =Element>`  Change 事件对象

- `KeyboardEvent<T =Element>` 键盘事件对象

- `MouseEvent<T =Element>` 鼠标事件对象

- `TouchEvent<T =Element>`  触摸事件对象

- `WheelEvent<T =Element>` 滚轮事件对象

- `AnimationEvent<T =Element>` 动画事件对象

- `TransitionEvent<T =Element>` 过渡事件对象

```typescript
import { MouseEvent } from 'react';

interface IProps {
  onClick (event: MouseEvent<HTMLDivElement>): void,
}

```



## 组件开发

### 有状态组件

```typescript
export class MyForm extends React.Component<FormProps, FormState> {
	...
}

```

其中的FormProps和FormState分别代表这状态组件的props和state的interface

>  **注意：**在只有state而没有props的情况下，props的位置可以用{}或者object占位，这两个值都表示有效的空对象。 

### 无状态组件

无状态组件也被称为展示组件，如果一个展示组件没有内部的state可以被写为纯函数组件。 如果写的是函数组件，在`@types/react`中定义了一个类型`type SFC = StatelessComponent;`。我们写函数组件的时候，能指定我们的组件为`SFC`或者`StatelessComponent`。这个里面已经预定义了`children`等，所以我们每次就不用指定类型children的类型了。

```tsx
import React, { ReactNode, SFC } from 'react';
import style from './step-complete.less';

export interface IProps  {
  title: string | ReactNode;
  description: string | ReactNode;
}
const StepComplete:SFC<IProps> = ({ title, description, children }) => {
  return (
    <div className={style.complete}>
      <div className={style.completeTitle}>
        {title}
      </div>
      <div className={style.completeSubTitle}>
        {description}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};
export default StepComplete;

```



