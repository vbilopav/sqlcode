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
        "addClass", "removeClass",
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

    HTMLElement.prototype.addClass = function(className) {
        if (this.classList) {
            this.classList.add(className);
        } else {
            this.className += " " + className;
        }
        return this;
    }

    HTMLElement.prototype.removeClass = function(className) {
        if (this.classList) {
            this.classList.remove(className);
        } else {
            this.className = this.className.replace(
                new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " "
            );
        }
        return this;
    }

    HTMLElement.prototype.css = function(property, value) {
        if (!this._styles) {
            this._styles = {};
            let styles = window.getComputedStyle(this);
            for(let style in styles) {
                if (!isNaN(style)) {
                    continue;
                }
                this._styles[style] = styles[style];
            }
        }
        if (value !== undefined) {
            this._styles[property] = value;
            this.style[property] = value;
            return this
        }
        let result = this._styles[property];
        if (result === undefined) {
            return this._styles[property.toCamelCase()];
        }
        return result;
    }

    HTMLElement.prototype.on = function(eventName, eventHandler) {
        for(let e of eventName.split(" ")) {
            this.addEventListener(e, eventHandler);
        }
        return this;
    }

    HTMLElement.prototype.off = function(eventName, eventHandler) {
        for(let e of eventName.split(" ")) {
            this.removeEventListener(e, eventHandler);
        }
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

    String.prototype.toCamelCase = function() {
        return this.replace(/-([a-z])/g, g => g[1].toUpperCase())
    }

    test(Document, ["on", "off"]);
    test(Window, ["on", "off"]);
    Document.prototype.on = HTMLElement.prototype.on;
    Window.prototype.off = HTMLElement.prototype.off;

    //
    // lit-html vs code extension support
    //
    String.html = (pieces, ...args) => String.raw(pieces, ...args)

});