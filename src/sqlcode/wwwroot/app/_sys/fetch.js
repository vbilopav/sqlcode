define([], () => {

    return {
        getStdResponse: async response => Object({
            ok: response.ok,
            status: response.status,
            data: await response.json()
        }),
        objToUrl: obj => Object.keys(obj).map(item => `${encodeURIComponent(item)}=${encodeURIComponent(obj[item])}`).join("&")
    }

});