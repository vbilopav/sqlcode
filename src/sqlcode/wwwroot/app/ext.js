define([], () => {
        
    const 
        test = (object, extensions) => {
            extensions.forEach(e => {
                if (object.prototype[e] !== undefined) {
                    throw new Error(`Error: Name collision - object ${object} already have defined "${e}" !`);
                }
            });
        };

    test(HTMLElement, [
        "find", "show", "hide", "html",
        "css", "_styles",
        "on", "off",
        "data", "_data"
    ]);

    HTMLElement.prototype.find = function(search) {
        let e = this.querySelector(search);
        if (!e) {
            e = "dummy".createElement();
            e.length = 0
            return e;
        }
        e.length = 1;
        return e;
    }

    HTMLElement.prototype.show = function() {
        this.style.display = ""; 
        return this;
    }

    HTMLElement.prototype.hide = function() {
        this.style.display = "none"; 
        return this;
    }

    HTMLElement.prototype.html = function(content) {
        if (content === undefined) {
            return this.innerHTML;
        }
        this.innerHTML = content;
        return this;
    }

    HTMLElement.prototype.css = function(property, value) {
        if (!this._styles) {
            this._styles = window.getComputedStyle(this);
        }
        if (value !== undefined) {
            this._styles[property] = this.style[property] = value;
            return this
        }
        return this._styles[property];
    }

    HTMLElement.prototype.on = function(eventName, eventHandler) {
        this.addEventListener(eventName, eventHandler);
        return this;
    }

    HTMLElement.prototype.off = function(eventName, eventHandler) {
        this.removeEventListener(eventName, eventHandler);
        return this;
    }

    HTMLElement.prototype.data = function(key, value) {
        if (!this._data) {
            this._data = Object.assign({}, this.dataset);
        }
        if (value !== undefined) {
            this._data[key] = value;
            return this;
        }
        return this._data[key];
    }

    //
    // lit-html vs code extension support
    //
    String.html = (pieces, ...args) => String.raw(pieces, ...args)

});