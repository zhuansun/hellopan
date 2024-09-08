Page({
    data: {
        url: ''
    },

    onLoad(query) {
        console.log(query)
        if (query && query.url) {
            this.setData({
                url: query.url
            });
        }
    },

})