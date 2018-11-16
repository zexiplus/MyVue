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
        let _this = this
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get(value) {
                // 伪代码： 1.进行订阅
                console.log('__ob__', value)
                return value
            },
            set(newValue) {
                if (newValue !== obj[key]) {
                    // 对新值继续劫持
                    _this.observer(newValue)
                    // 用新值替换旧值
                    obj[key] = newValue
                    // 伪代码： 1.发布通知
                }
            }
        })
    }
}