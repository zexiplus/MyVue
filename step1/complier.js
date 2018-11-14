class Complier {
    constructor(el, vm) {
        // 把dom节点挂载在Complier实例上
        this.el = this.getDOM(el)
        // 把mvvm实例挂载在complier实例上
        this.vm = vm
        // debugger
        if (this.el) {
            // 如果存在再编译成文档片段
            // 编译解析出相应的指令 如 v-text, v-model, {{}}
            // 保存原有dom节点到fragment文档片段， 并做替换

            // 先暂存到内存中去
            let fragment = this.toFragment(this.el)
        } else {
            // 没有找到el根节点给出警告
            console.error(`can not find element named ${el}`)
        }
    }

    // 根据传入的值， 如果是dom节点直接返回， 如果是选择器， 则返回相应的dom节点
    getDOM(el) {
        if (this.isElement(el)) {
            return el
        } else {
            return document.querySelector(el) || null
        }
    }

    // 判断dom类型， 1 为元素， 2 是属性， 3是文本， 9是文档, 11是文档片段
    isElement(el) {
        return el.nodeType === 1
    }

    // 把el dom节点转换为fragment保存在内存中并返回
    toFragment(el) {
        let fragment = document.createDocumentFragment()
        let firstChild
        // 循环把el的首个子元素推入fragment中
        while (firstChild = el.firstChild) {
            // 把原始 el dom节点的所有子元素增加到文档片段中并移除原 el dom节点的所有子元素
            fragment.appendChild(firstChild)
            // debugger
            // console.log('el dom is', el)
            // console.log('fragment is', fragment)
        }
        return fragment
    }
}

