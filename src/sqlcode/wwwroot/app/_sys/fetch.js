define([], () => {

    return {
        getStdResponse: async response => Object({
            ok: response.ok,
            status: response.status,
            data: response.ok ? await response.json() : null
        }),
        url: obj => Object.keys(obj).map(item => `${encodeURIComponent(item)}=${encodeURIComponent(obj[item])}`).join("&")
    }

});