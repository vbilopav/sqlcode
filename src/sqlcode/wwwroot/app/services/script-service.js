define([], () => {

    // temporary storage
    const store = {};

    return {
        save: (id, type, {viewState, content, title}) => {
            console.log("save: ", id, type, title);
            store[type + id] = {
                type: type,
                viewState: viewState,
                content: content,
                title: title
            }
        },
        retreive: (id, type) => store[type + id],
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