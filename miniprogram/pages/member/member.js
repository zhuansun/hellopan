import {
    api
} from '../../utils/http'
import {
    setStorage,
    getStorage
} from '../../utils/storage'

import {
    toast
} from '../../utils/extendApi'

Page({
    data: {
        hasLogin: false,
        userInfo: {}, //用户信息
        memberTips: [],
        authCode: "", //授权码
        indexModel: 'PIC', //默认为图片模式
        authCodeBuyUrl: ''
    },

    onLoad() {
        this.getAllConfigSaveStorage().then(result => {
            const hellopanConfig = getStorage('hellopan');
            console.log('配置获取成功', hellopanConfig);
            const userInfoStorage = getStorage('userInfo')
            this.setData({
                userInfo: userInfoStorage,
                hasLogin: userInfoStorage !== null && userInfoStorage !== undefined
            })
            this.getAllConfig()
            this.getindexModel()
        }).catch(error => {
            console.error('配置获取失败', error);
        });
    },

    onShow() {
        this.getindexModel()
    },

    /**
     * 当用户输入授权码的时候
     */
    onAuthCodeChange(e) {
        const value = e.detail;
        this.setData({
            authCode: value
        });
    },

    /**
     * 当用户确认授权码的时候
     */
    async onAuthCodeComfirm() {
        if (this.data.authCode.trim() === '') {
            toast({
                title: '不能为空',
                icon: 'error'
            })
            return;
        }
        const vipCmd = {
            "operate": "applogin",
            "params": {
                "openId": this.generateRandomString(24),
                "authCode": this.data.authCode.trim(),
                "parentUserId": 2
            }
        }
        let responseData = await api(vipCmd);
        if (responseData.code === 200) {
            const that = this;
            that.setData({
                userInfo: responseData.data.data,
                hasLogin: true
            })
            toast({
                title: '成功',
                icon: 'success'
            })
            setStorage('userInfo', responseData.data.data)
            setStorage('refreshSource', 1)
            wx.redirectTo({
                url: '../../pages/source/source'
            })
        }

    },

    generateRandomString(length) {
        var result = 'hwp_';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    getAllConfig() {
        const map = getStorage("hellopan")
        this.setData({
            memberTips: map['MEMBER_TIPS_CONFIG'][0] //提示
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


    openIndexModelOnChange({
        detail
    }) {
        // 需要手动对 checked 状态进行更新
        this.setData({
            indexModel: detail ? 'PIC' : 'TEXT'
        });
        setStorage('indexModel', this.data.indexModel)
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


})