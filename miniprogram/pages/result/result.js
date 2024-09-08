import {
    getStorage
} from '../../utils/storage'

import {
    toast,
    modal
} from '../../utils/extendApi'
import {
    api
} from '../../utils/http'


Page({
    data: {
        value: '',
        searchview: false, //是否展示搜索内容
        searchList: [], //搜索结果
        doubanInfo: {},
        showdoubanInfoIntro: '',
        hasCopyPermission: true,//复制权限
        copyPermissionUnitID: '', //复制权限的广告ID
        hasReminderPermission: true, //催更权限
        reminderPermissionUnitID: '', //提醒广告ID
        globalConfigAdOpen: false, //全局AD开关
        shareConfig: {},
        showReminder: false, //展示催更的输入框
        reminderQuestion: '' //用户输入的提醒问题
    },

    /**
     * 点击展开douban详情
     */
    onDoubanInfoIntroShow(event) {
        this.setData({
            showdoubanInfoIntro: event.detail,
        });
    },


    // 监听页面的加载
    onLoad(query) {
        // 判断用户是否登录
        const userInfo = getStorage('userInfo')
        if (userInfo === undefined || userInfo === null || userInfo.openId === undefined || userInfo.openId === null || userInfo.openId === '') {
            wx.redirectTo({
                url: '../../pages/member/member'
            });
        }
        this.getAllConfig()
        if (query && query.value) {
            this.setData({
                value: query.value
            });
            wx.setNavigationBarTitle({
                title: this.data.value
            })
            this.onSearch()
        }
    },

    //获取所有的配置
    getAllConfig() {
        const map = getStorage("hellopan")
        this.setData({
            globalConfigAdOpen: (map['AD_CONFIG'][0] === '1'),
            shareConfig: JSON.parse(map['SHARE_CONFIG_RESULT'][0]),
            copyPermissionUnitID: map['AD_UNIT_ID_COPY_PERMISSION'][0],
            reminderPermissionUnitID: map['AD_UNIT_ID_REMINDER_PERMISSION'][0]
        })
    },

    async onSearch() {
        if (this.data.value.trim() === '') {
            //没有输入内容的时候，不执行搜索
            return;
        }

        const queryCmd = {
            "operate": "search",
            "params": {
                "value": this.data.value.trim()
            }
        }
        const res = await api(queryCmd)
        this.setData({
            searchList: res.data.data.resourceList,
            doubanInfo: res.data.data.info,
            searchview: true,
            hasCopyPermission: (this.data.globalConfigAdOpen ? false : true),
            hasReminderPermission: (this.data.globalConfigAdOpen ? false : true),
            showReminder: false,
            reminderQuestion: ''
        });
    },

    //下拉刷新
    async onPullDownRefresh() {
        await this.getAllConfig()
        this.onSearch()
        wx.stopPullDownRefresh()
    },

    //加载广告
    async loadCopyAd() {
        this.setData({
            hasCopyPermission: true
        })
    },

    /**
     * 打开催更弹窗
     */
    showReminderPopup() {
        if (this.data.hasReminderPermission) {
            this.setData({
                showReminder: true
            })
        } else {
            this.loadNotifyUpdateAd()
        }
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
     * 提交催更
     */
    async onSubmitReminder() {
        const reminderCmd = {
            "operate": "reminder",
            "params": {
                "reminderType": "HURRY",
                "question": this.data.value + this.data.reminderQuestion
            }
        }
        await api(reminderCmd)
        toast({
            title: '催更成功',
            icon: 'success'
        })
        //关闭弹窗
        this.setData({
            hasReminderPermission: false,
            showReminder: false,
            reminderQuestion: ''
        })
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
            showReminder: true,
            hasReminderPermission: true
        })
    },

    async onSearchItemClick(e) {
        if (this.data.globalConfigAdOpen) {
            //开了全局广告，校验有没有复制权限。
            if (!this.data.hasCopyPermission) {
                this.loadCopyAd()
                return
            }
        }
        // 获取传递的URL
        const url = e.currentTarget.dataset.item;

        //校验url是否有效
        const checkCmd = {
            "operate": "urlCheck",
            "params": {
                "url": url
            }
        }
        const res = await api(checkCmd)
        var that = this;
        if (res.data !== undefined && res.data !== null && res.data.data === true) {
            wx.setClipboardData({
                data: url,
                success(res) {
                    toast({
                        title: '已复制',
                        icon: 'success'
                    })
                }
            })
        } else {
            const res = await modal({
                title: '提示',
                content: '链接可能失效，确定复制吗？',
                cancelText: '就这个',
                confirmText: '换一个',
            })
            if (!res) {
                wx.setClipboardData({
                    data: url,
                    success(res) {
                        toast({
                            title: '已复制',
                            icon: 'success'
                        })
                    }
                })
            }
        }
    },
});