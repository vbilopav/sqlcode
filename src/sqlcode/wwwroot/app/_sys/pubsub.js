define([], () => {

    const 
        entries = {};

    return class {
        constructor(obj) {
            if (obj.sub || obj.pub) {
                throw new Error("pubsub already assigned to object!");
            }
            obj.sub = (name, handler) => {
                let entry = entries[name];
                if (!entry) {
                    entry = entries[name] = [];
                } 
                entries[name].push(handler);
                return obj;
            };
            obj.pub = (name, ...args) => {
                let entry = entries[name];
                if (!entry) {
                    return obj;
                }
                entry.forEach(f => f.apply(obj, args));
                return obj;
            };
        }
    }
});