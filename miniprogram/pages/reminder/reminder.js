import {
    api
} from '../../utils/http'

import {
    toast,
    modal
} from '../../utils/extendApi'

Page({
    data: {
        activeName: '',
        reminderList: [],
        showReminder: false, //展示催更的输入框
        reminderQuestion: '', //用户输入的提醒问题
        reminderTitle: '', //求片，还是咨询,
        reminderType: '' //NEED ASK
    },
    onChange(event) {
        this.setData({
            activeName: event.detail,
        });
    },

    onLoad() {
        this.getReminderList()
    },

    async getReminderList() {
        const reminderCmd = {
            "operate": "reminderlist",
            "params": {}
        }
        const res = await api(reminderCmd)
        this.setData({
            reminderList: res.data.data
        })
    },

    //下拉刷新
    onPullDownRefresh() {
        this.getReminderList()
        wx.stopPullDownRefresh()
    },

    /**
     * 打开弹窗
     */
    showAskReminderPopup() {
        this.loadNotifyUpdateAd()
    },

    /**
     * 关闭催更弹窗
     */
    closeReminderPopup() {
        this.setData({
            showReminder: false,
            reminderQuestion: ''
        })
    },

    /**
     * 提交催更，需要看广告
     */
    onSubmitReminder() {
        //加载广告
        this.nofityUpdate(true)
    },

    /**
     * 用户输入催更的信息
     */
    onInputReminderQuestion(e) {
        this.setData({
            reminderQuestion: e.detail.value
        })
    },


    //加载广告
    async loadNotifyUpdateAd() {
        this.setData({
            reminderTitle: '我要留言',
            reminderType: 'ASK',
            showReminder: true
        })
    },

    async nofityUpdate(adResult) {
        if (adResult) {
            const reminderCmd = {
                "operate": "reminder",
                "params": {
                    "reminderType": this.data.reminderType,
                    "question": this.data.reminderQuestion
                }
            }
            await api(reminderCmd)

            this.closeReminderPopup()
            await this.getReminderList()
            toast({
                title: '成功',
                icon: 'success'
            })

        } else {
            toast({
                title: '失败',
                icon: 'error'
            })
        }
    },

})