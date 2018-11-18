# STEP3
步骤3， 此章节在步骤1, 2的基础上， 新增加 Observer类实现数据劫持
* MVVM 
* Compiler
* **Observer** 





### Observer

Observer 观察者， 对数据进行劫持， 对data的每一个属性设置 getter和setter， 用来数据发生变动时通知观察者触发视图更新



* **observer**

  数据观察器， 遍历对象属性， 设置属性为响应式

  ```js
  observer(data) {
      // 递归的终止条件： 当观察数据不存在或不再是对象是停止
      if (!data || typeof data !== 'object') {
          return
      }
      Object.keys(data).forEach(key => {
          // 递归调用自身， 深层遍历对象属性
          this.observer(data[key])
          // 调用响应式函数， 设置响应式属性
          this.setReactive(data, key)
      })
  }
  ```


* **setReactive**

  设置响应式的函数， 对数据进行劫持， 设置getter和setter，当get时订阅消息， 当set时发布通知

  ```js
  setReactive(data, key) {
      let _this = this
      Object.defineProperty(data, key, {
          enumerable: true,
          configurable: true,
          get(value) {
              // 进行订阅
              return value
          },
          set(newValue) {
              if (newValue !== data[key]) {
                  // 设置新值， 新值没有进行过响应式处理， 所以要重新observer
                  data[key] = newValue
                  _this.observer(data[key])
                  // 发布通知
              }
          }
      })
  }
  ```
