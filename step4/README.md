# STEP4
步骤4， 此章节实现Watcher类, 将其作为comiler和observer的一个中介点，在接收数据变更的同时，让Dep添加当前Watcher，并及时通知视图进行update
* MVVM 
* Compiler
* Observer 
* **Watcher**



### Watcher

* 保存初始值, 设置Dep的target对象
* 保存接收通知时的回调函数.
*  对比新旧值, 更新视图变化

```js
class Watcher {
	constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        
        // 保存原始值
        this.value = this.getValAndSetTarget()
    }
    getValAndSetTarget() {
        // 设置Dep.target 
    	Dep.target = this
        let value = this.parseExpr()
        Dep.target = null
        return value
    }
    parseExpr(expr) {
    	let attr = expr.split('.')
        return attr.reduce((prev, next) => {
            return prev[next]
        }
    }
    update() {
    	let newVal = this.parseExpr(this.expr)
        let oldVal = this.value
        if (newVal !== oldVal) {
            this.cb && this.cb()
        }
    }
}
```



### Compiler

每个表达式都有一个对应的watcher. 

例如 {{message.a}}   就会有一个 new Watcher(vm, 'message.a', updateText)

```js
class Compiler {
	constructor() {...}
    text(node, vm, expr) {
        let updateFn = this.updater['textUpdater'];
        
        let value = this.getTextVal(vm,expr);
        expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            /********************* add code **************************/
            new Watcher(vm,arguments[1],(newValue)=>{
                updateFn && updateFn(node,this.getTextVal(vm,expr));
            })
            /********************************************************/
            return arguments[1];
        });
        updateFn && updateFn(node,value);
    }
}
```





### Dep

Dep用于添加watcher对象和通知数据变化

```javascript
class Dep {
	constructor() {
        this.subs = []
    }
    // 添加watcher对象
    addSubs(watcher) {
        this.subs.push(watcher)
    }
    // 通知数据变化
    notify() {
        this.subs.forEach(watcher => watcher.update()
    }
}
```





### Observer

Observer 观察者， 对数据进行劫持， 对data的每一个属性设置 getter和setter， 用来数据发生变动时通知观察者触发视图更新


* **setReactive**

  设置响应式的函数， 对数据进行劫持， 设置getter和setter，**当get时订阅消息， 当set时发布通知**

  ```js
  setReactive(data, key) {
      let _this = this
      let dep = new Dep()
      Object.defineProperty(data, key, {
          enumerable: true,
          configurable: true,
          get(value) {
              // 进行订阅, Dep.target是一个watcher对象
              /**************** add code ********************/
              Dep.target && dep.addSubs(Dep.target)
              /**************** ******** ********************/
              return value
          },
          set(newValue) {
              if (newValue !== data[key]) {
                  // 设置新值， 新值没有进行过响应式处理， 所以要重新observer
                  data[key] = newValue
                  _this.observer(data[key])
                  // 发布通知
                  /****************** add code **********************/
                  dep.notify()
                  /**************************************************/
              }
          }
      })
  }
  ```
