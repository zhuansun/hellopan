import {
    api
} from '../../utils/http'

import {
    getStorage,
    setStorage,
    clearStorage,
    removeStorage
} from '../../utils/storage'

import {
    toast
} from '../../utils/extendApi'

Page({
    data: {
        topSearchShowBgColor: '',
        value: '',
        hotDataList: [], //热门资源
        hotDataEmpty: false,
        noticeInfo: [], //公告栏
        bannerUrl: '../../assets/images/banner.jpg',
        footContent: '', //页脚
        shareConfig: {},
        menuConfig: {},
        indexModel: 'PIC' //默认为图片模式
    },

    //下拉刷新
    onPullDownRefresh() {
        this.getAllConfig()
        this.getHotData()
        this.getindexModel()
        wx.stopPullDownRefresh()
    },


    // 监听页面的加载
    onLoad(query) {
        setStorage("parentUserId", 2)
        // 判断用户是否登录
        const userInfo = getStorage('userInfo')
        if (userInfo === undefined || userInfo === null || userInfo.openId === undefined || userInfo.openId === null || userInfo.openId === '') {
            console.log("跳转去登录---source")
            wx.redirectTo({
                url: '../../pages/member/member'
            });
        }
        this.onPullDownRefresh()
    },

    onPageScroll(e) {
        if (e.scrollTop > 100) {
            this.setData({
                topSearchShowBgColor: '#fff'
            })
        }
        if (e.scrollTop < 100) {
            this.setData({
                topSearchShowBgColor: ''
            })
        }
    },

    onShow() {
        //清空value
        this.setData({
            value: ''
        })
        const refreshSource = getStorage('refreshSource');
        if (refreshSource === undefined || refreshSource === null || refreshSource != 1) {
            //获取首页样式
            this.getindexModel()
        } else {
            this.getAllConfigSaveStorage().then(result => {
                const hellopanConfig = getStorage('hellopan');
                console.log('配置获取成功', hellopanConfig);
                this.onPullDownRefresh()
                removeStorage("refreshSource")
            }).catch(error => {
                console.error('配置获取失败', error);
            });
        }
    },

    //获取所有的配置
    getAllConfig() {
        const map = getStorage("hellopan")
        this.setData({
            value: '',
            noticeInfo: map['NOTICE_CONFIG'], //公告栏
            bannerUrl: map['BANNER_CONFIG'][0],
            footContent: map['FOOT_CONFIG'][0], //页脚
            shareConfig: JSON.parse(map['SHARE_CONFIG_SOURCE'][0]),
            menuConfig: JSON.parse(map['MENU_CONFIG'][0]), //底部菜单配置
            followUs: map['FOLLOW_US'][0]
        })
    },


    getAllConfigSaveStorage() {
        return new Promise((resolve, reject) => {
            console.log("hellopan storage 设置...");
            const configCmd = {
                "operate": "config",
                "params": {
                    "codeClass": 'HELLO_PAN_CONFIG'
                }
            }
            api(configCmd).then(configRes => {
                const map = {};
                if (configRes.data === undefined || configRes.data === null || configRes.data.data === undefined || configRes.data.data === null) {
                    resolve(true);
                    return;
                }
                configRes.data.data.forEach(item => {
                    if (!map[item.code]) {
                        map[item.code] = [];
                    }
                    map[item.code].push(item.codeValue);
                });
                setStorage('hellopan', map);
                console.log("hellopan storage 设置成功");
                resolve(true);
            }).catch(error => {
                console.error('配置获取失败', error);
                reject(error);
            });
        });
    },


    // 获取Hot数据
    async getHotData() {
        // 调用接口 API 函数，获取数据
        const hotDataCmd = {
            "operate": "hot"
        }
        const res = await api(hotDataCmd)
        // 需要对数据进行赋值，在赋值的时候，一定要注意索引
        this.setData({
            hotDataList: res.data.data, //探索更多
            hotDataEmpty: res.data.data.length === 0
        })
    },

    //用户输入查询参数
    onSearchInpusChange(e) {
        //有三个来源：用户输入框中输入； 点击热门资源TEXT，点击热门资源PIC
        var value = e.detail.value;
        this.setData({
            value: value
        });
        if (value.trim() === '') {
            this.getHotData()
            return;
        }
    },

    async onSearch() {
        if (this.data.value.trim() === '') {
            //没有输入内容的时候，不执行搜索
            return;
        }
        wx.navigateTo({
            url: `/pages/result/result?value=${this.data.value}`
        })
    },


    onHotDataClick(e) {
        //刷新首页热门数据
        this.getHotData()
    },
    onHotDataMore(e) {
        //加载更多
        var clickType = e.currentTarget.dataset.type;
        console.log(e.currentTarget.dataset.type)
        const map = new Map();
        this.data.hotDataList.forEach(item => {
            if (!map.has(item.type)) {
                map.set(item.type, []);
            }
            map.get(item.type).push(...item.hotList);
        });
        var clickHotDataList = map.get(clickType)
        wx.navigateTo({
            url: `/pages/msource/msource`,
            success: res => {
                // 这里给要打开的页面传递数据.  第一个参数:方法key, 第二个参数:需要传递的数据
                res.eventChannel.emit('setClickHotDataList', clickHotDataList)
                res.eventChannel.emit('setClickHotDataType', clickType)
            }
        })

    },

    onHotItemClick(e) {
        // 获取传递的URL
        const hotItemName = e.currentTarget.dataset.item;
        var detailValue;
        if (this.data.indexModel === 'PIC') {
            detailValue = hotItemName.name
        }
        if (this.data.indexModel === 'TEXT') {
            detailValue = hotItemName
        }
        // 创建一个新的事件对象
        const event = {
            detail: {
                value: detailValue
            }
        };
        // 触发 onChange 方法，并传递新的事件对象
        this.onSearchInpusChange(event);
        this.onSearch();
    },

    //网络异常，点击重试
    onNetErrorRetry() {
        this.onPullDownRefresh()
    },


    //获取首页样式
    getindexModel() {
        const indexModel = getStorage('indexModel');
        if (indexModel) {
            this.setData({
                indexModel: indexModel
            })
        }
    },

    //clealAllStorage
    clealAllStorage() {
        clearStorage()
        toast({
            title: '清理成功',
            icon: 'success'
        })
    }

});