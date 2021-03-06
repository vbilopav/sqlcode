define(["sys/storage"], Storage => {

    class Splitter {
        constructor({
            name,
            element=(() => {throw "element is required"})(),
            container,
            dockPosition = 0,
            resizeIdx,
            autoIdx,
            maxDelta=250, 
            min=150,
            events={docked: ()=>{}, undocked: ()=>{}, changed: ()=>{}}
        }) {
            this._element = element;
            this._container = container;
            this._cursor = document.body.css("cursor");
            this._dockPos = dockPosition;
            this._events = events;
            this._events.changed = this._events.changed || (()=>{});
            this._storage = name ? new Storage({namespace: name, model: {position: null}}) : {position: null};
            this._offset = null;
            this._docked = false;
            this._resizeIdx = resizeIdx;
            this._autoIdx = autoIdx;
            this._maxDelta = maxDelta;
            this._min = min;
        }
    
        start() {
            this._element.on("mousedown", e => {
                this._offset = this._calcOffset(e);
                document.body.css("cursor", this._element.css("cursor"));
            });
            document
                .on("mouseup", e => {
                    if (this._offset === null) {
                        return true;
                    }
                    this._offset = null;
                    document.body.css("cursor", this._cursor);
                    if (this._docked) {
                        return true;
                    }
                    const {_, prev} = this._getValuesArray();
                    this._storage.position = prev;
                })
                .on("mousemove", e => {
                    if (this._offset === null) {
                        return true;
                    }
                    e.preventDefault();
                    e.stopPropagation();
        
                    const pos = this._getPos(e),
                          calc = this._calcPos(pos, e),
                          {values, prev} = this._getValuesArray(calc + "px"),
                          rect = this._container.getBoundingClientRect();

                    if (this._calcDelta(rect, pos) <= this._maxDelta) {
                        return false;
                    }

                    if (this._getMin(pos, calc) <= this._min) {
                        if (!this._docked) {
                            this.dock();
                            return false;
                        } else {
                            return false;
                        }
                    } else {
                        if (this._docked) {
                            this.undock(false, this._min);
                            return false;
                        }
                    }

                    this._container.css(this._css, values.join(" "));
                    this._events.changed(...this._css, values);
                    return false;
                });
            return this;
        }
    
        get docked() {
            return this._docked;
        }
        
        dock(noevent=false) {
            const {values, prev} = this._getValuesArray(this._dockPos + "px");
            this._storage.position = prev;
            this._container.css(this._css, values.join(" "));
            this._docked = true;
            if (noevent) {
                return
            }
            this._events.docked();
        }
    
        undock(noevent=false, pos=this._maxDelta) {
            if (!this._docked) {
                return;
            }
            if (pos === undefined) {
                pos = this._storage.position;
            }
            if (this._storage.position >= pos) {
                pos = this._storage.position;
            }
            const {values} = this._getValuesArray(pos + "px");
            this._container.css(this._css, values.join(" "));
            this._docked = false;
            if (noevent) {
                return
            }
            this._events.undocked();
        }

        getValues(newPos) {
            return this. _getValuesArray(newPos);
        }

        move(delta, values) {
            values = values || this. _getValuesArray();
            if (values.prev <= this._min) {
                return false;
            }
            const p = values.prev + delta;
            this._storage.position = p;
            values.values[this._resizeIdx] = p + "px";
            this._container.css(this._css, values.values.join(" "));
        }

        _adjust() {
            if (this._storage.position) {
                let {values} = this._getValuesArray(this._storage.position + "px");
                this._container.css(this._css, values.join(" "));
            }
        }
    
        _getValues() {
            return this._container.css(this._css).split(" ") 
        }
    
        _getValuesArray(newPos) {
            const values = this._getValues();
            const prev = Number(values[this._resizeIdx].replace("px", ""));
            if (newPos) {
                values[this._resizeIdx] = newPos;
                values[this._autoIdx] = "auto";
            }
            return {values, prev};
        }
    
        _getPos(e) {
            return e[this._prop];
        }

        _curent() {
            return Number(this._getValues()[this._resizeIdx].replace("px", ""));
        }
    }

    return [

        class Vertical extends Splitter {
            constructor(options) {
                super(options);
                this._dir = "v";
                this._element.addClass("splitter-v");
                this._prop = "clientX";
                this._css = "grid-template-columns";
                this._adjust();
            }

            _calcPos(pos) {
                return pos + this._offset;
            }

            _calcOffset(e) {
                const value = this._curent();
                return value - this._getPos(e);
            }

            _calcDelta(rect, pos) {
                return rect.width - pos;
            }

            _getMin(pos, calc) {
                return pos;
            }
        },

        class Horizontal extends Splitter {
            constructor(options) {
                super(options);
                this._dir = "h";
                this._element.addClass("splitter-h");
                this._prop = "clientY";
                this._css = "grid-template-rows";
                this._adjust();
            }

            _calcPos(pos, e) {
                return this._offset[1] + (this._offset[0] - this._getPos(e));
            }

            _calcDelta(rect, pos) {
                return pos;
            }

            _calcOffset(e) {
                return [this._getPos(e), this._curent()];
            }

            _getMin(pos, calc) {
                return calc;
            }
        }

    ]

});
