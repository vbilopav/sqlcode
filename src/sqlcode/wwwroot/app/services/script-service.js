define(["sys/fetch"], f => {
    
    const 
        baseUrl = "/api/scripting";

    return {

        save: async (id, type, {viewState, content, title}) => await f.getStdResponse(
            await fetch(
                `${baseUrl}?${f.url({id: id, type: type, title: title, ViewState: JSON.stringify(viewState)})}`, 
                {
                    method: "POST", 
                    body: content
                }
            )
        ),

        retreive: async (id, type) => await f.getStdResponse(
            await fetch(`${baseUrl}?${f.url({id: id, type: type})}`),
            data => {
                data.viewState = JSON.parse(data.viewState);
                return data;
            }
        ),
        
        getNames: async type => await f.getStdResponse(
            await fetch(`${baseUrl}/titles?type=${type}`)
        ),

        updateTitle: async (id, type, title) => await f.getStdResponse(
            await fetch(
                `${baseUrl}/title?${f.url({id: id, type: type, title: title})}`, {method: "POST"}
            )
        ),

        getItems: async type => await f.getStdResponse(
            await fetch(`${baseUrl}/items?type=${type}`)
        ),

        updateViewState: async (id, type, viewState) => await f.getStdResponse(
            await fetch(
                `${baseUrl}/viewstate?${f.url({id: id, type: type})}`, 
                {
                    method: "POST", 
                    body: JSON.stringify(viewState)
                }
            )
        )
    }

});