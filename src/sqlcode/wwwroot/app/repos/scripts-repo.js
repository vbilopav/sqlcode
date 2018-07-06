
// this is crap, it all needs to go to backend
define([], () => {
    
    const 
        repo = {};

    return class {

        constructor(type) {
            this.type = type;
            repo[this.type] = {};
        }

        add(id, title, isEmpty) {
            repo[this.type][id] = {title: title, isEmpty: isEmpty}
        }

        setTitle(id, title) {
            repo[this.type][id].title = title;
        }

        getNewTitle(template) {
            let counter = 0,
                suggestion = template(counter);
            for(let obj in repo[this.type]) {
                if (suggestion === obj.title) {
                    suggestion = template(counter++);
                }
            }
        }

    }

});