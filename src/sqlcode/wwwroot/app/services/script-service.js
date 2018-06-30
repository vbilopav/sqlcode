define(["sys/fetch"], f => {

    return {

        save: async (id, type, {viewState, content, title}) => await f.getStdResponse(
            await fetch(
                `/api/scripting?${f.objToUrl({
                    Id: id, 
                    Type: type, 
                    Title: title, 
                    ViewState: JSON.stringify(viewState)
                })}`, {method: "POST", body: content}
            )
        ),

        retreive: async (id, type) => await f.getStdResponse(
            await fetch(`/api/scripting?${f.objToUrl({Id: id, Type: type})}`)
        ),
        
        getNames: async type => await f.getStdResponse(
            await fetch(`/api/scripting/titles?type=${type}`)
        ),

        updateTitle: async (id, type, title) => await f.getStdResponse(
            await fetch(
                `/api/scripting/title?${f.objToUrl({
                    Id: id, 
                    Type: type, 
                    Title: title
                })}`, {method: "POST"}
            )
        ),

        getItems: async type => await f.getStdResponse(
            await fetch(`/api/scripting/items?type=${type}`)
        )

    }

});