class MVVM {
    constructor(options) {
        // 初始化参数， 把el， data等进行赋值与绑定
        this.$el = options.el
        // data如果是函数就取返回值， 如果不是则直接赋值
        this.$data = typeof options.data === 'function' ? options.data() : options.data
        // 把$el真实的dom节点编译成vdom, 并解析相关指令
        if (this.$el) {
            new Complier(this.$el, this)
        }
        new Observer(this.$data)
    }
}