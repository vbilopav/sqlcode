define(["sys/model"], Model => class {

    constructor({container, name="", height=40}) {
        this._model = new Model().bind(
            container
                .css("display", "grid")
                .css("grid-template-rows", height + "px auto")
                .html(
                    String.html`
                        <div id="tabs" class="tabs noselect"></div>
                        <div id="content" class="tabs-container" ></div>`
                )
        );
        this._id = 0;
        this._count = 0;
        this._name = name;
        this._active = undefined;

        this.beforeCreate = (()=>true);
        this.afterCreate = (()=>{});

        this.beforeClose = (()=>true);
        this.afterClose = (()=>{});

        window.on("resize", () => {
            if (this.active) {
                this.reveal(this.active);
            }
        })
    }

    get active() {
        return this._active;
    }

    get tabs() {
        return this._model.tabs;
    }

    createTabs(tabs=[]) {
        for(let opts of tabs) {
            this.create(opts); 
        }
    }

    create({tabHtml, contentHtml, active=false}) {
        let id = this._name + ++this._id;
        this._count++;

        let content = "div"
            .createElement(id, contentHtml)
            .data("id", this._id)
            .addClass("tab-content");

        let tab = "span"
            .createElement(id, tabHtml)
            .addClass("tab")
            .data("content-ref", content)
            .data("id", this._id)
            .on("click", e => this._tabClick(e));
        
        if (!this.beforeCreate({tab: tab, content: content, count: this._count})) {
            this._id--;
            this._count--;
            return;
        }

        this._toggleContent(content, active).appendTo(this._model.content);
        this._toggleTab(tab, active).appendTo(this._model.tabs)

        if (active) {
            this._active = tab;
        }
        this.afterCreate({tab: tab, content: content, count: this._count});
        return this;
    }

    closeByTab(tab) {
        let content = tab.data("content-ref");
        if (!this.beforeClose({tab: tab, content: content, count: this._count})) {
            return;
        }
        tab.remove();
        content.remove();
        this._count--;
        this.afterClose({tab: tab, content: content, count: this._count});
        let lowest;
        for(let tab of this.tabs.children) {
            if (lowest) {
                if (lowest.data("id") > tab.data("id")) {
                    lowest = tab;
                }
            } else {
                lowest = tab;
            }
        }
        if (lowest) {
            this.activate(lowest);
        }
    }

    activate(tab) {
        if (tab.data("active")) {
            return this;
        }
        this._toggle(this._active, false);
        this._toggle(tab, true);
        this._active = tab;
        this.reveal(tab);
        return this;
    }

    reveal(tab) {
        if (!this.tabs.overflownX()) {
            return
        }
        let tabRect = tab.getClientRects(),
            tabsRect = this.tabs.getClientRects();
        if (tabRect[0].x < tabsRect[0].x) {
            tab.scrollIntoView({behavior: "instant", block: "start", inline: "start"})
        }
        if (tabRect[0].x + tabRect[0].width > tabsRect[0].x + tabsRect[0].width) {
            tab.scrollIntoView({behavior: "instant", block: "end", inline: "end"});
        }
    }

    _toggleTab(tab, active) {
        return tab
            .toggleClass("tab-active", active)
            .toggleClass("tab-inactive", !active)
            .data("active", active)
    }

    _toggleContent(content, active) {
        return content
            .toggleClass("tab-content-active", active)
            .toggleClass("tab-content-inactive", !active)
            .data("active", active)
            .show(active)
    }

    _toggle(tab, state) {
        this._toggleContent(
            this._toggleTab(tab, state).data("content-ref"), 
            state
        );
        return this;
    }

    _tabClick(e) {
        if (e.currentTarget.data("active")) {
            return
        }
        if (e.target.data("canceled")) {
            e.target.data("canceled", false);
            return
        }
        this.activate(e.currentTarget);
        return this;
    }

});
