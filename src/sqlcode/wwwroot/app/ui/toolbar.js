define(["spa/model"], Model => {

    const 
        _cls = "active";

    return 
        class {
            constructor ({element, click}) {
                this._last = null;
                this._active = "docs";
                this._click = click;
                this._buttons = new Model({
                    oncreate: button => {
                        button.removeClass(_cls).on("click", e => {
                            if (e.target.data("toggle")) {
                                e.target.toggleClass(_cls);
                                click[e.target.id](e.target.hasClass(_cls));
                                return;
                            }
                            this._buttons.each(button => {
                                if (button.hasClass(_cls)) {
                                    click[button.id](false);
                                }
                                button.removeClass(_cls);
                            });
                            if (this._active === e.target.id) {
                                this._active = null;
                                click["off"]();
                                return;
                            }
                            this._active = e.target.id;
                            e.target.addClass(_cls);
                            click[this._active](true);
                        })
                    }
                }).bind(element);

                this._buttons.terminal.data("toggle", true);
                this._buttons.menu.data("toggle", true);
                this._buttons[this._active].addClass(_cls);
                
                if (click === undefined) {
                    click = {}
                }
                this._buttons.each((_, name) => {
                    if (click[name] === undefined) {
                        click[name] = (()=>{});
                    }
                });
            }

            deactivate() {
                this._last = this._active;
                this._active = null;
                this._buttons[this._last].removeClass(_cls);
                this._click[this._last](false);
            }

            activate() {
                this._active = this._last;
                this._buttons[this._active].addClass(_cls);
                this._click[this._active](true);
            }
        }
});