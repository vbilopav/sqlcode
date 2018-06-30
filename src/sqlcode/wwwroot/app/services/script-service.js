define(["sys/fetch"], f => {
    
    const 
        baseUrl = "/api/scripting";

    return {

        save: async (id, type, {viewState, content, title}) => await f.getStdResponse(
            await fetch(
                `${baseUrl}?${f.objToUrl({
                    Id: id,
                    Type: type,
                    Title: title,
                    ViewState: JSON.stringify(viewState)
                })}`, {method: "POST", body: content}
            )
        ),

        retreive: async (id, type) => await f.getStdResponse(
            await fetch(`${baseUrl}?${f.objToUrl({Id: id, Type: type})}`)
        ),
        
        getNames: async type => await f.getStdResponse(
            await fetch(`${baseUrl}/titles?type=${type}`)
        ),

        updateTitle: async (id, type, title) => await f.getStdResponse(
            await fetch(
                `${baseUrl}/title?${f.objToUrl({
                    Id: id, 
                    Type: type, 
                    Title: title
                })}`, {method: "POST"}
            )
        ),

        getItems: async type => await f.getStdResponse(
            await fetch(`${baseUrl}/items?type=${type}`)
        )

    }

});