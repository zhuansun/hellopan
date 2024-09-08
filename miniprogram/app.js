import {
    api
} from './utils/http'

import {
    setStorage
} from './utils/storage'


App({
    onLoad() {},
    onShow() {
        this.getAllConfigSaveStorage()
    },
    onHide() {},
    onUnload() {},

    /**
     * 启动的时候，获取配置，存在本地
     */
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
})