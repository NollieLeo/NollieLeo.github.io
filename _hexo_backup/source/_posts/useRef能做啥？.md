---
title: useRef能做啥？
date: 2021-08-03 15:29:45
categories:
- React
tags:
- useRef
- forwardRef
- useImperativeHandle
- hooks

---



## useRef

<u>**`useRef`主要的功能就是。**</u>

1. 帮助我们获取到**DOM元素或者组件实例**
2. 保存在组件**生命周期内不会变化**的值

如下：

```jsx
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // `current` 指向已挂载到 DOM 上的文本输入元素
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}

```

这个创建ref的过程是这样的

1. 组件初始化，执行到useRef，初始化了一个参数null
2. 这时候触发render了，这个过程实现了一个ref的挂载，从`null`到相对应的组件实例或者DOM挂载，相当于对`ref.current`的赋值了，这个过程会有一个ref的数据变化

### 两个特点

- 每次组件重新渲染useRef的返回值都是同一个（引用不变）
- `ref.current`发生变化的时候，不会触发组件的重新渲染，区别于其他的hooks

因此引出两个场景

#### 1.不要单独拿ref作为依赖项

```jsx
useEffect(()=>{
    ....
},[ref]);

useEffect(()=>{
  ...  
}, []);
```

上面两者相当于是一样的了，因为ref始终是同一个引用。



#### 2.手动调用自己的ref挂载函数

这里我们需要通过`callback ref`的形式去挂载

```tsx
function MeasureExample() {
  const [height, setHeight] = useState(0);

  const measuredRef = useCallback(node => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return (
    <>
      <h1 ref={measuredRef}>Hello, world</h1>
      <h2>The above header is {Math.round(height)}px tall</h2>
    </>
  );
}

```

> 注意：这里的ref挂载针对的是DOM元素，如果是要拿组件的ref，则往下看



## forwardRef

我们用`forwardRef`包裹函数式组件，见下例

```tsx
const Parent = () => {
  const childRef = useRef(null);

  useEffect(() => {
    ref.current.focus();
  }, []);

  return (
    <>
      <Child ref={ref} />
    </>
  );
};
const Child = forwardRef((props, ref) => {
  return <input type="text" name="child" ref={ref} />;
});

```

使用`forwardRef`包裹之后，函数式组件会获得被分配给自己的ref（作为第二个参数）。如果你没有使用`forwardRef`而直接去`ref`的话，`React`会报错。



## useImperativeHandle

上面`forwardRef`的例子中，`Parent`中的`ref`拿到了`Child`组件的完整实例，它不但可以使用`focus`方法，还可以使用其它所有的DOM方法，比如`blur`,`style`。这种方式是不推荐的，我们需要严格的控制`ref`的权力，控制它所能调用到的方法。

所以我们要使用`useImperativeHandle`来限制暴露给父组件的方法。

```jsx
const Parent = () => {
  const childRef = useRef(null);

  useEffect(() => {
    // 这里只能调用到focus方法
    ref.current.focus();
  }, []);

  return (
    <>
      <Child ref={ref} />
    </>
  );
};
const Child = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input type="text" name="child" ref={inputRef} />;
});

```

这样子，我们就可以手动控制需要暴露给父组件的方法。



## 应用

### 获取上一次的值

```tsx
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

```

这个hooks返回出来的值，在渲染的过程中，总是会显示上一次的值。我们来解析一下这个函数的运行步骤。 假设上例中`ref`的初始值传入的`value`是0,每次数据更新传入的都是递增的数据，比如1，2，3。

- 初始化，ref.current = 0，渲染出来 
- 数据变化，`value`传入1, 因为`useEffect`会在渲染完毕之后才执行，所以这次的渲染过程中，这个为1的`value`值不会赋值给`ref.current`。渲染出来的还是上一个值0，渲染完毕了，`ref.current`变为1。但是`ref.current`变化不会触发组件的重新渲染，所以需要等到下次的渲染才能显示到页面上。
- 如此往复，渲染的就总是上一次的值。



### 使用useRef来保存不需要变化的值

 因为`useRef`的返回值在组件的每次`redner`之后都是同一个，所以它可以用来保存一些在组件整个生命周期都不需要变化的值。最常见的就是定时器的清除场景。 

刚开始在`React`里写定时器，你可能会这样写

```jsx
const App = () => {
  let timer;

  useEffect(() => {
    timer = setInterval(() => {
      console.log('触发了');
    }, 1000);
  },[]);

  const clearTimer = () => {
    clearInterval(timer);
  }

  return (
    <>
      <Button onClick={clearTimer}>停止</Button>
    </>)
}

```

但是上面这个写法有个巨大的问题，如果这个`App`组件里有`state`变化或者他的父组件重新`render`等原因导致这个`App`组件重新`render`的时候，我们会发现，点击按钮停止，定时器依然会不断的在控制台打印，定时器清除事件无效了。

为什么呢？因为组件重新渲染之后，这里的`timer`以及`clearTimer `方法都会**重新创建**，`timer`已经不是定时器的变量了。

所以对于定时器，我们都会使用`useRef`来定义变量。

```jsx
const App = () => {
  const timer = useRef();

  useEffect(() => {
    timer.current = setInterval(() => {
      console.log('触发了');
    }, 1000);
  },[]);

  const clearTimer = () => {
    clearInterval(timer.current);
  }

  return (
    <>
      <Button onClick={clearTimer}>停止</Button>
    </>)
}

```



### 实现深度比较useEffect

普通的`useEffect`只是一个浅比较的方法，如果我们依赖的`state`是一个对象，组件重新渲染，这个`state`对象的值没变，但是内存引用地址变化了，一样会触发`useEffect`的重新渲染。

```tsx
const createObj = () => ({
    name: 'zouwowo'
});
useEffect(() => {
  // 这个方法会无限循环
}, [createObj()]);

```

我们来使用`useRef`实现一个深度依赖对比的`useDeepEffect`

```jsx
import equal from 'fast-deep-equal';
export useDeepEffect = (callback, deps) => {
  const emitEffect = useRef(0);
  const prevDeps = useRef(deps);
  if (!equal(prevDeps.current, deps)) {
    // 当深比较不相等的时候，修改emitEffect.current的值，触发下面的useEffect更新
    emitEffect.current++;
  }
  prevDeps.current = deps;
  return useEffect(callback, [emitEffect.current]);
}

```

