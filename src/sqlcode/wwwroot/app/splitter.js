define([], () => class {
    constructor ({element, direction, resize, auto}) {
        this._element = element || (() => {throw element})();
        this._parent = this._element.parentElement;
        direction === "h" || direction === "v" || (() => {throw direction})();
        this._element.addClass("splitter-" + direction);
        this._prop = direction === "h" ? "clientX" : "clientY";
        this._css = direction === "h" ? "grid-template-columns" : "grid-template-rows";
        !isNaN(resize) || (() => {throw resize})();
        this._resize = resize;
        !isNaN(auto) || (() => {throw auto})();
        this._auto = auto;
        this._offset = null;
        let getValues = () => this._parent.css(this._css).split(" ");
        this._element.on("mousedown", e => {
            let value = getValues()[this._resize].replace("px", "");
            this._offset = value - e[this._prop];
        });
        document.on("mouseup", () => this._offset = null);
        document.on("mousemove", e => {
            if (this._offset === null) {
                return
            }
            e.preventDefault();
            let values = getValues();
            values[this._resize] = e[this._prop] + this._offset + "px";
            values[this._auto] = "auto";
            this._element.parentElement.css(this._css, values.join(" "));
        });
    }
});