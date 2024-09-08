import {
    api
} from '../../utils/http'

Page({
    data: {
        activeName: '1',
        problemList: []
    },
    onChange(event) {
        this.setData({
            activeName: event.detail,
        });
    },

    onLoad() {
        this.getProblemList()
    },

    async getProblemList() {
        const configCmd = {
            "operate": "config",
            "params": {
                "codeClass": 'PROBLEM_CENTER'
            }
        }
        const res = await api(configCmd);
        this.setData({
            activeName: res.data.data[0].code,
            problemList: res.data.data
        })
    },

    //下拉刷新
    onPullDownRefresh() {
        console.log('刷新')
        this.getProblemList()
        wx.stopPullDownRefresh()
    },
})