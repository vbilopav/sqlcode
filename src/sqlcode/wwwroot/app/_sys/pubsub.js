define([], () => {

    const 
        entries = {};

    return class {
        constructor(obj) {
            if (obj.subscribe || obj.publish) {
                throw new Error("pubsub already assigned to object!");
            }
            obj.subscribe = (name, handler) => {
                let entry = entries[name];
                if (!entry) {
                    entry = entries[name] = [];
                } 
                entries[name].push(handler);
                return obj;
            };
            obj.publish = (name, ...args) => {
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