define([], () => class {

    constructor({storage, namespace}) {
        this.storage = storage || localStorage;
        this.namespace = namespace || "";
        if (this.namespace) {
            this.namespace + ".";
        }
    }

});