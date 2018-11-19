# STEP1
步骤1， 此章节主要实现Complier编译器和MVVM构造函数的主要逻辑
* **MVVM**

* Compiler



### MVVM

* **保存el， data等 options参数**

  ```js
  new MVVM({
      el: '#app',
      data() {...}
  })
  ```

* **数据监控与劫持**

  ```js
  new Observer(this.$data)
  ```

* **编译dom节点**

  ```js
  new Complier(this.$el, this)
  ```

* **数据代理，**` this.data.message === this.message`

  ```js
  proxy(data) {
      Object.keys(data).forEach(key => {
          Object.defineProperty(this, key, {
              enumerable: true,
              configurable: true,
              get() {
                  return data[key]
              },
              set(newValue) {
                  data[key] = newValue
              }
          })
      })
  }
  ```



* **MVVM Class**

  ```js
  class MVVM {
      constructor(options) {
          // 初始化参数， 把el， data等进行赋值与绑定
          this.$el = options.el
          // data如果是函数就取返回值， 如果不是则直接赋值
          this.$data = typeof options.data === 'function' ? options.data() : options.data
          // 数据代理, 把data对象属性代理到vm实例上
          this.proxy(this.$data)
          // debugger
          // 把$el真实的dom节点编译成vdom, 并解析相关指令
          if (this.$el) {
              // 数据劫持, 
              new Observer(this.$data)
              new Complier(this.$el, this)
          }
      }
      // 数据代理, 访问/设置 this.a 相当于访问设置 this.data.a
      proxy(data) {
          Object.keys(data).forEach(key => {
              Object.defineProperty(this, key, {
                  enumerable: true,
                  configurable: true,
                  get() {
                      return data[key]
                  },
                  set(newValue) {
                      data[key] = newValue
                  }
              })
          })
      }
  }
  ```



### Complier

* 通过选择器找到根节点，保存el到自身实例, 保存mvvm单例对象

  ```js
  this.el = document.querySelector(el)
  this.vm = vm
  ```

* 创建fragment文档片段并把原始el dom元素的所有子节点增加到 fragment并返回

  ```js
  let fragment = document.createDocumentFragment()
  let firstChild
  while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild)
  
  }
  return fragment
  ```


