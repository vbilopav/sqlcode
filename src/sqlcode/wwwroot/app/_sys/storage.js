define([], () => {

    const 
        names = [];

    return class {
        constructor({
            storage=localStorage,
            namespace="", 
            model=(() => {throw new Error("model is required!")})(), 
            conversion={}
        }) {
            this._storage = storage;
            this._namespace = namespace;
            this._model = model;
            this._conversion = conversion;
            if (this._namespace) {
                this._namespace = this._namespace + ".";
            }
            for(let [name, defualtValue] of Object.entries(model)) {
                this.create(name, defualtValue);
            }
        }
    
        create(name, defualtValue) {
            let namespace = this._getNamespace(name);
            if (names.indexOf(namespace) !== -1) {
                throw new Exception(`Name "${namespace}" is already been defined!`);
            }
            names.push(namespace);
            Object.defineProperty(this, name, {
                get: () => {
                    let value = this._storage.getItem(namespace);
                    if (value === null && defualtValue !== undefined) {
                        return defualtValue;
                    }
                    let conversion = this._conversion[name];
                    if (conversion) {
                        return conversion(value);
                    }
                    return value;
                },
                set: value => {
                    if (value === null) {
                        this._storage.removeItem(namespace);
                    } else {
                        this._storage.setItem(namespace, value);
                    }
                }
            });
            return this;
        }

        _getNamespace(name) {
            if (this._namespace) {
                return this._namespace + name;
            } else {
                return name;
            }
        }
    }

});