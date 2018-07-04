define([], () => {

    return {
        getStdResponse: async (response, dataFunc=data=>data) => Object({
            ok: response.ok,
            status: response.status,
            data: response.ok ? dataFunc(await response.json()) : null
        }),
        url: obj => Object.keys(obj).map(item => `${encodeURIComponent(item)}=${encodeURIComponent(obj[item])}`).join("&")
    }

});