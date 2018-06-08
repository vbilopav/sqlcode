define([], () => {

    // temporary storage
    const store = {};

    return {
        save: (id, type, {viewState, content, title}) => {
            store[type + id] = {
                viewState: viewState,
                content: content,
                title: title
            }
        },
        retreive: (id, type) => store[type + id]
    }

});