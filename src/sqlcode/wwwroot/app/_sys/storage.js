define([], () => {

    const 
        names = [];
    
    var
        defaultStorage,
        defaultNs;

    class Storage {
        constructor({
            storage=defaultStorage,
            namespace="", 
            model=(() => {throw new Error("model is required!")})(), 
            conversion={}
        }) {
            this._storage = Storage._check(storage);
            if (!defaultNs) {
                throw new Exception("default namespace cannot be empty or null");
            }
            this._ns = namespace;
            this._model = model;
            this._conversion = conversion;
            if (this._ns) {
                this._ns = this._ns + ".";
            }
            for(let [name, defualtValue] of Object.entries(model)) {
                this.create(name, defualtValue);
            }
        }

        static setStorage(storage) {
            defaultStorage = Storage._check(storage);
            return Storage;
        }

        static setNamespace(ns) {
            if (!ns) {
                ns = "";
            } else {
                ns = ns + "."
            }
            defaultNs = ns;
            return Storage;
        }

        static transferTo(storage) {
            Storage._check(storage);
            Storage._transfer(defaultStorage, storage);
            return Storage;
        }

        static transferFrom(storage) {
            Storage._check(storage);
            Storage._transfer(storage, defaultStorage);
            return Storage;
        }

        static _transfer(source, target) {
            for (let i=0, l=target.length; i<l; i++) {
                let key = target.key(i);
                if (!key) {
                    continue;
                }
                if (key.startsWith(defaultNs)) {
                    target.removeItem(key);
                }
            }
            for (let i=0, l=source.length; i<l; i++) {
                let key = source.key(i)
                target.setItem(key, source.getItem(key));
            }
        }

        static _check(storage) {
            if (!storage.getItem || !storage.setItem || !storage.removeItem) {
                throw new Error("missing proeprty on storage object")
            }
            return storage;
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
            if (this._ns) {
                return defaultNs + this._ns + name;
            } else {
                return defaultNs + name;
            }
        }
    }

    return Storage;
});