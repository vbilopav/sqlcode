define([], () => class {
    constructor (
        {element, container, direction, resizeIndex, autoIndex, dockPosition, events}
    ) {
        this._element = element || (() => {throw element})();
        this._container = container;
        direction === "h" || direction === "v" || (() => {throw direction})();
        this._element.addClass("splitter-" + direction);
        this._prop = direction === "h" ? "clientX" : "clientY";
        this._css = direction === "h" ? "grid-template-columns" : "grid-template-rows";
        !isNaN(resizeIndex) || (() => {throw resizeIndex})();
        this._resizeIdx = resizeIndex;
        !isNaN(autoIndex) || (() => {throw autoIndex})();
        this._autoIdx = autoIndex;
        this._cursor = document.body.css("cursor");
        this._dockPos = dockPosition;
        this._events = events || {docked: ()=>{}, undocked: ()=>{}};

        this._offset = null;
        this._docked = false;
        this._dockTimeout = undefined;
        this._dockPrev = null;
    }

    run (maxDelta=250, min=150) {
        this._element.on("mousedown", e => {
            let value = this._getValues()[this._resizeIdx].replace("px", "");
            this._offset = value - this._getPos(e);
            document.body.css("cursor", this._element.css("cursor"));
        });
        document.on("mouseup", () => {
            this._offset = null;
            document.body.css("cursor", this._cursor);
        });
        document.on("mousemove", e => {
            if (this._offset === null) {
                return
            }
            e.preventDefault();
            let pos = this._getPos(e);
            let {values, _} = this._getValuesArray(pos + this._offset + "px");
            let pr = this._container.getBoundingClientRect();
            if (pr.width - pos <= maxDelta) {
                return false;
            }
            if (pos <= min) {
                if (!this._docked) {
                    if (this._dockTimeout) {
                        return false;
                    }
                    this._dockTimeout = setTimeout(() => {
                        let pos = this._getPos(e);
                        clearTimeout(this._dockTimeout);
                        this._dockTimeout = undefined;
                        if (pos > min) {
                            return;
                        }
                        this.dock();
                        this._events.docked();
                    }, 1);
                    return false;
                } else {
                    return false;
                }
            } else {
                if (this._docked) {
                    this.undock(min);
                    this._events.undocked();
                }
            }
            this._container.css(this._css, values.join(" "));
        });
        return this;
    }

    dock() {
        let {values, prev} = this._getValuesArray(this._dockPos + "px");
        this._dockPrev = prev;
        this._container.css(this._css, values.join(" "));
        this._docked = true;
    }

    undock(pos) {
        if (!this._docked) {
            return;
        }
        if (pos === undefined) {
            pos = this._dockPrev;
        }
        let {values, _} = this._getValuesArray(pos + "px");
        this._container.css(this._css, values.join(" "));
        this._docked = false;
    }

    _getValues() {
        return this._container.css(this._css).split(" ") 
    }

    _getValuesArray(newPostition) {
        let values = this._getValues();
        let prev = Number(values[this._resizeIdx].replace("px", ""));
        values[this._resizeIdx] = newPostition;
        values[this._autoIdx] = "auto";
        return {values, prev};
    }

    _getPos(e) {
        return e[this._prop];
    }
});