/**
 * @description 封装消息提示组件
 * @param {*} title 提示的内容
 * @param {*} icon 图标
 * @param {*} duration 提示的延迟时间
 * @param {*} mask 是否显示透明蒙层，防止触摸穿透
 */
export const toast = ({
    title = '数据加载中',
    icon = 'none',
    mask = true,
    duration = 1500
} = {}) => {
    wx.showToast({
        title,
        icon,
        mask,
        duration
    })
}



/**
 * @description 封装 wx.showModal  方法
 * @param {*} options 同 wx.showModal 配置项
 */
export const modal = (options = {}) => {
    // 使用 Promise 处理 wx.showModal 的返回结果
    return new Promise((resolve) => {

        // 默认的参数
        const defaultOpt = {
            title: '提示',
            content: '您确定执行该操作吗?',
            confirmColor: '#f3514f',
            confirmText: '确定',
            cancelText: '取消'
        }

        // 将传入的参数和默认的参数进行合并
        const opts = Object.assign({}, defaultOpt, options)

        wx.showModal({
            // 将合并的参数赋值传递给 showModal 方法
            ...opts,
            complete({
                confirm,
                cancel
            }) {
                // 如果用户点击了确定，通过 resolve 抛出 true
                // 如果用户点击了取消，通过 resolve 抛出 false
                confirm && resolve(true)
                cancel && resolve(false)
            }
        })
    })
}

// 在 wx 全局对象上封装 myToast 方法
// 调用 API 方式：
// 1. 在入口文件 app.js 导入封装的模块  import './utils/extendApi'
// 2. 调用封装的方法：wx.toast('')
wx.toast = toast
wx.modal = modal
