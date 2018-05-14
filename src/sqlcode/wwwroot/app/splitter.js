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
        let getPos = e => e[this._prop];
        this._element.on("mousedown", e => {
            let value = getValues()[this._resize].replace("px", "");
            this._offset = value - getPos(e);
        });
        document.on("mouseup", () => this._offset = null);
        document.on("mousemove", e => {
            if (this._offset === null) {
                return
            }
            let values = getValues();
            let pos = getPos(e);
            values[this._resize] = pos + this._offset + "px";
            values[this._auto] = "auto";
            //console.log(this._parent.getBoundingClientRect());
            //console.log(e[this._prop]);
            if (this._parent.getBoundingClientRect().width - e[this._prop] <= 150) {
                return;
            } 
            e.preventDefault();
            this._element.parentElement.css(this._css, values.join(" "));
        });
    }
});