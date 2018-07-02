define([], () => class {
    
    constructor({content, filterBtn, inputFilter}) {
        this.content = content;
        this.filterBtn = filterBtn;
        this.inputFilter = inputFilter;
        this._timeout = undefined;
    }

    _clear() {
        for (let item1 of this.content.findAll(".panel-item")) {
            item1.show().find(".title").html(item1.data("title"));
        }
    }

    execute() {
        const val = this.inputFilter.value.trim().toLowerCase();
        if (val === "") {
            this._clear();
            return;
        }
        for (let item1 of this.content.findAll(".panel-item")) {
            const titleElement = item1.find(".title");
            const title = item1.data("title");
            const valIndex = title.toLowerCase().indexOf(val);

            if (valIndex !== -1) {
                item1.show();
                const
                    segment = title.substring(valIndex, valIndex + val.length),
                    newTitle = title.substring(0, valIndex) +
                        "<span class='selected'>" +
                        segment +
                        "</span>" +
                        title.substring(valIndex + val.length, title.length);
                titleElement.html(newTitle);
            } else {
                item1.hide();
                titleElement.html(item1.data("title"));
            }
        }
    }

    activate(state) {
        if (state === true) {
            this.filterBtn.css("border-style", "inset").data("state", state);
            this.inputFilter.visible(true).setFocus().select();
            this.execute();
            this.inputFilter.on("keyup", () => {
                if (this._timeout) {
                    clearTimeout(this._timeout);
                }
                this._timeout = setTimeout(() => this.execute(), 250);
            });
        } else if (state === false) {
            this.filterBtn.css("border-style", "").data("state", state);
            this.inputFilter.visible(false);
            this._clear();
            this.inputFilter.off("keyup");
        } else if (state === undefined) {
            return this.filterBtn.data("state");
        }
    }

    toggle() {
        this.activate(!this.filterBtn.data("state"));
    }

});