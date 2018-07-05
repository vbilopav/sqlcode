define([], () => {
    
    const 
        repo = {};

    return class {

        constructor(type) {
            this.type = type;
        }

        add(id, title, empty) {
            repo[type][id] = {title: title, empty: empty}
        }

    }

});