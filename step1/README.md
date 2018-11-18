# STEP1
步骤1， 此章节主要实现Complier编译器和MVVM构造函数的主要逻辑
* **MVVM**

* Compiler








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



### MVVM

* 传入el， data等 options参数

  ```js
  new MVVM({
      el: '#app',
      data() {...}
  })
  ```

* 调用Complier构造函数, 编译dom