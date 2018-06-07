define([], () => {

    // temporary storage
    const store = {};

    return {
        saveById: (id, {viewState, content, title}) => {
            store[id] = {
                viewState: viewState,
                content: content,
                title: title
            }
        },
        retreiveById: id => store[id]
    }

});