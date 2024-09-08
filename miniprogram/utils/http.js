import WxRequest from './request'

import {
    getStorage
} from './storage'

import {
    toast
} from './extendApi'
import {
    env
} from './env'

var openId = 'app_default_user_open_id';
var globalCounter = 0;

// ===========================================================================================
// ===============================【主要线路配置】===============================================
// ===============================【主要线路配置】===============================================

//主线路
const instance = new WxRequest({
    baseURL: env.baseURL,
    timeout: 15000,
    isLoading: false
})

// 配置请求拦截器
instance.interceptors.request = (config) => {
    // 在请求发送之前做点什么……
    if (globalCounter === 0) {
        wx.showLoading({
            title: '加载中...',
        })
        globalCounter++
    } else {
        globalCounter++
    }
    config.header['openId'] = openId
    const userInfo = getStorage('userInfo')
    if (userInfo) {
        config.header['openId'] = userInfo.openId
    }
    // throw new Error('Reached the termination condition');
    config.header['env'] = env.version
    return config
}

// 配置响应拦截器
instance.interceptors.response = async (response) => {
    if (globalCounter === 0) {
        wx.hideLoading()
    } else {
        globalCounter--
        if (globalCounter === 0) {
            wx.hideLoading()
        }
    }

    //失败情况1：response 为 null
    if (response === undefined || response === null) {
        console.log("失败情况1")
        return null;
    }

    const {
        data,
        isSuccess
    } = response

    //失败情况2：response 不是 null，但是明确告知 请求失败
    if (!isSuccess) {
        console.log("失败情况2")
        return null
    }

    //失败情况3：response 不是 null，也没有告知请求失败，但是没有响应体
    //失败情况4：response 不是 null，也没有告知请求失败，有响应体，但是没有code
    if (data === undefined || data === null || data.code === undefined || data.code === null) {
        console.log("失败情况3")
        return null;
    }

    //系统给了响应体，说明此时请求是成功的。
    switch (data.code) {
        // 如果后端返回的业务状态码等于 200，说请求成功，服务器成功响应了数据
        case 200:
            // 在这里可以对服务器响应数据做点什么……
            return data
        default:
            toast({
                title: data.msg === undefined ? '未知异常' : data.msg,
                icon: 'error'
            })
            return data
    }
}

// ===========================================================================================
// ===============================【备用线路配置】===============================================
// ===============================【备用线路配置】===============================================
//备用线路
const instance2 = new WxRequest({
    baseURL: env.baseURL2,
    timeout: 15000,
    isLoading: false
})

instance2.interceptors.request = (config) => {
    // 在请求发送之前做点什么……
    if (globalCounter === 0) {
        wx.showLoading({
            title: '加载中...',
        })
        globalCounter++
    } else {
        globalCounter++
    }
    config.header['openId'] = openId
    const userInfo = getStorage('userInfo')
    if (userInfo) {
        config.header['openId'] = userInfo.openId
    }
    config.header['env'] = env.version
    return config
}
instance2.interceptors.response = async (response) => {
    if (globalCounter === 0) {
        wx.hideLoading()
    } else {
        globalCounter--
        if (globalCounter === 0) {
            wx.hideLoading()
        }
    }
    const {
        isSuccess,
        data
    } = response
    //备用线路也挂了，那就真的挂了。。算球吧
    if (!isSuccess) {
        toast({
            title: '网络异常请重试',
            icon: 'error'
        })
        return response
    }
    switch (data.code) {
        case 200:
            return data
        default:
            toast({
                title: data.msg === undefined ? '未知异常' : data.msg,
                icon: 'error'
            })
            return Promise.reject(response)
    }
}


export const retryPostRequest = async (url, request={}) => {
    let isFail = true;
    let responseData = {};
    try {
        responseData = await instance.post(url, request);
        //没有响应体才算是失败，返回了明确的状态码，就不算失败
        // isSuccess = (response != undefined && response.code === 200);
        isFail = (responseData === undefined || responseData === null);
    } catch (error) {
        console.error("请求异常:", error);
        isFail = true;
    }
    if (isFail) {
        return instance2.post(url, request);
    }
    return responseData;
};

export const api = (apiCmd) => {
    //openID， authCode
    return retryPostRequest('/hellopan/api/v1', apiCmd)
}
