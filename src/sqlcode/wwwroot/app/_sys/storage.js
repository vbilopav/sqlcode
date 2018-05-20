define([], () => {

    const names = [];

    return class {
        constructor({storage, namespace, model}) {
            this._storage = storage || localStorage;
            this._namespace = namespace || "";
            if (this._namespace) {
                this._namespace = this._namespace + ".";
            }
            if (!model) {
                throw new Error("model is required!");
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