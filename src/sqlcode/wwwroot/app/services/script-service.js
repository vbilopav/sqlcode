define([], () => {

    // temporary storage
    const store = {};

    return {
        save: (id, type, {viewState, content, title}) => {
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
        }
    }

});