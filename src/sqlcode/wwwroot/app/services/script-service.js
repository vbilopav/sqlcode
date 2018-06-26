define([], () => {

    // temporary storage
    const store = {};

    return {
        save: (id, type, {viewState, content, title}) => {
            console.log("save: ", id, type, title, viewState, content);
            store[type + id] = {
                type: type,
                viewState: viewState,
                content: content,
                title: title
            }

            let q = {Id: id, Type: type, Title: title, ViewState: JSON.stringify(viewState)};
            fetch(
                "/api/scripting?" + q.toUrlParams(), {
                method: "POST",
                body: content,
                headers:{
                  "Content-Type": "text/plain"
                }
              });
        },
        retreive: (id, type) => {
            let q = {Id: 234345, Type: type}
            fetch(
                "/api/scripting?" + q.toUrlParams(), {
                method: "GET",
                headers:{
                  "Content-Type": "application/json"
                }
              });

            return store[type + id]
        },
        getNames: type => {
            let result = [];
            for(let [key, item] of Object.entries(store)) {
                if (type && item.type === type)  {
                    result.push(item.title);
                }
            }
            return result;
        },
        updateTitle: (id, type, title) => {
            console.log("updateTitle: ", id, type, title);
            let entry = store[type + id];
            entry.title = title;
        }
    }

});