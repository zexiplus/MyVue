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

            // 转化为文档片段并存到内存中去
            let fragment = this.toFragment(this.el)

            // 编译节点
            this.compile(fragment)

            // 把编译后的文档片段重新添加到document中
            this.el.appendChild(fragment)
            
        } else {
            // 没有找到el根节点给出警告
            console.error(`can not find element named ${el}`)
        }
    }

    // 编译节点，如果子节点是node节点， 递归调用自身和compileNode， 如果不是 则调用 compileText
    compile(parentNode) {
        let childNodes = parentNode.childNodes
        // console.log('childNodes is', childNodes)
        childNodes.forEach((node, index) => {
            if (this.isElement(node)) {
                this.compile(node)
                this.compileNode(node)
            } else if (this.isText(node)) {
                this.compileText(node)
            }
        })
    }

    // 编译文本节点
    compileText(node) {
        // 测试文本节点含有 {{val}} 的 regexp
        let reg = /\{\{([^}]+)\}\}/g
        // 拿到文本节点的文本值
        let text = node.textContent
        if (reg.test(text)) {
            // 去掉{{}} 保留 value
            let attrName = text.replace(reg, (...args) => {
                // 对每个{{}}之类的表达式增加增加一个watcher,参数为vm实例, expr表达式, 更新回调函数
                new Watcher(this.vm, args[1], (value) => {
                    // console.log('update???')
                    
                    compileUtil.updateText(value, node, this.vm)
                })
                return args[1]
            })
            // 例如取出{{message}} 中的 message, 交给compileUtil.updateText 方法去查找vm.data的值并替换到节点
            let textValue = this.splitData(attrName, this.vm.$data)
            compileUtil.updateText(textValue, node, this.vm)
        }
    }

    // 剥离属性值
    splitData(attr, data) {
        // 传入 attr 形如 'group.member.name', 找到$data上对应的属性值并返回
        let arr = attr && attr.split('.')
        let ret = arr.reduce((prev, next) => {
            return prev[next]
        }, data)
        return ret
    }

    // 编译node节点
    compileNode(node) {
        let attrs = node.getAttributeNames()
        // 把已v-指令存到一个数组中
        attrs = attrs.filter(this.isDirective)
        attrs.forEach((item) => {
            let expr = node.getAttribute(item)
            let value = this.splitData(expr, this.vm.$data)
            if (compileUtil[item]) {
                compileUtil[item](value, node, this.vm, expr)
            } else {
                console.warn(`can't find directive ${item}`)
            }
        })
    }

    // 判断节点属性是否是指令
    isDirective(text) {
        return text.includes('v-')
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

    isText(el) {
        return el.nodeType === 3
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

// 编译功能函数的集合单例
const compileUtil = {
    updateText(text, node, vm, expr) {
        // console.log('compileUtil.updateText text is', text)
        node && (node.textContent = text)
    },
    //  在绑定有v-model节点的input上绑定事件, expr为v-model的表达式例如 'message.name'
    'v-model': function (value, node, vm, expr) {
        node && (node.value = value)
        node.addEventListener('input', (e) => {
            this.setVal(vm.$data, expr, e.target.value)
        })
    },
    // 解析vm.data上的v-model绑定的值
    setVal(obj, expr, value) {
        let arr = expr.split('.')
        arr.reduce((prev, next) => {
            if (arr.indexOf(next) == arr.length - 1) {
                prev[next] = value
            } else {
                return prev[next]
            }
        }, obj)
    }
}

class Observer {
    constructor(data) {
        this.observer(data)
    }

    observer(data) {
        // 递归的终止条件： 当观察数据不存在或不再是对象是停止
        if (!data || typeof data !== 'object') {
            return
        }
        Object.keys(data).forEach(key => {
            // 递归调用自身， 遍历对象上的所有属性都为响应式的
            this.observer(data[key])
            this.setReactive(data, key)
        })
    }
    // 响应式  对数据的修改会触发相应的功能
    setReactive(obj, key) {
        let value = obj[key]
        let _this = this
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                // 进行订阅
                Dep.target && dep.addSubs(Dep.target)
                
                return value
            },
            set(newValue) {
                if (newValue !== obj[key]) {
                    // 对新值继续劫持
                    _this.observer(newValue)
                    // 用新值替换旧值
                    value = newValue
                    // 发布通知
                    dep.notify()
                }
            }
        })
    }
}

class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        // 在new Watcher时保存初始值
        this.value = this.getValAndSetTarget()
    }
    getValAndSetTarget() {
        Dep.target = this
        let value = this.getValue(this.expr)
        Dep.target = null
        return value
    }
    getValue(expr) {
        let arr = expr.split('.')
        return arr.reduce((prev, next) => {
            return prev[next]
        }, this.vm.$data)
    }
    update() {
        let oldVal = this.value
        let newVal = this.getValue(this.expr)
        if (oldVal !== newVal) {
            this.cb && this.cb(newVal)
        }
    }
}

class Dep {
    constructor() {
        this.subs = []
    }
    addSubs(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        // console.log('notified')
        this.subs.forEach(watcher => watcher.update())
    }
}