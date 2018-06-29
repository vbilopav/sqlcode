define([], () => {

    const getResult = async response => Object({
        ok: response.ok,
        status: response.status,
        data: await response.json()
    });

    return {

        save: async (id, type, {viewState, content, title}) => await getResult(
            await fetch(
                `/api/scripting?${Object({
                    Id: id, 
                    Type: type, 
                    Title: title, 
                    ViewState: JSON.stringify(viewState)
                }).toUrlParams()}`, {method: "POST", body: content}
            )
        ),

        retreive: async (id, type) => await getResult(
            await fetch(`/api/scripting?${Object({Id: id, Type: type}).toUrlParams()}`)
        ),
        
        getNames: async type => await getResult(
            await fetch(`/api/scripting/titles?type=${type}`)
        ),

        updateTitle: async (id, type, title) => await getResult(
            await fetch(
                `/api/scripting/title?${Object({
                    Id: id, 
                    Type: type, 
                    Title: title
                }).toUrlParams()}`, {method: "POST"}
            )
        ),

        getItems: async type => await getResult(
            await fetch(`/api/scripting/items?type=${type}`)
        ),

    }

});