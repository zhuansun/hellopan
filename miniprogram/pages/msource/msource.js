
Page({
    data: {
        clickHotDataType: '',
        clickHotDataList: [] //用户选中的热门资源数据
    },


    // 监听页面的加载
    onLoad() {
        // 接收上个页面传递来的数据
        let eventChannel = this.getOpenerEventChannel()
        // setAddressEditData和上个页面设置的相同即可
        eventChannel.on('setClickHotDataList', (clickHotDataList) => {
            this.setData({
                clickHotDataList: clickHotDataList || []
            })
            console.log(this.data.clickHotDataList)
        })
        eventChannel.on('setClickHotDataType', (clickHotDataType) => {
            this.setData({
                clickHotDataType: clickHotDataType
            })
            wx.setNavigationBarTitle({
                title: this.data.clickHotDataType
            })
        })
    },


    onHotItemClick(e) {
        console.log(e)
        // 获取传递的URL
        const hotItemName = e.currentTarget.dataset.item;
        this.onSearch(hotItemName);
    },

    async onSearch(value) {
        if (value.trim() === '') {
            //没有输入内容的时候，不执行搜索
            return;
        }
        wx.navigateTo({
            url: `/pages/result/result?value=${value}`
        })
    },

});