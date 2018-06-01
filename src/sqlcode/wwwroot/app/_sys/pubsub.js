define([], () => {

    const 
        entries = {};

    return class {
        constructor(obj) {
            if (obj.sub || obj.pub) {
                throw new Error("pubsub already assigned to object!");
            }
            obj.sub = (name, handler) => {
                //if (_app.dev) {
                //    console.log(`subscribed: ${name}`)
                //}
                let entry = entries[name];
                if (!entry) {
                    entry = entries[name] = [];
                } 
                entries[name].push(handler);
                return obj;
            };
            obj.pub = (name, ...args) => {
                //if (_app.dev) {
                //    console.log(`published: ${name}`)
                //}
                let doPub = n => {
                    let entry = entries[n];
                    if (!entry) {
                        return obj;
                    }
                    setTimeout(() => entry.forEach(f => f.apply(obj, args)), 0);
                }
                if (name instanceof Array) {
                    for(let i of name) {
                        doPub(i);
                    }
                } else {
                    doPub(name);
                }
                return obj;
            };
        }
    }
});