define(["sys/model"], Model => class {

    constructor({
        container, 
        name="", 
        height=40, 
        tabCreated=(()=>{}),
        contentCreated=(()=>{}),
        tabs=[]
    }) {
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
        this._name = name;
        this._tabCreated = tabCreated;
        this._contentCreated = contentCreated;
        this._active = undefined
        for(let opts of tabs) {
            this.create(opts); 
        }
    }

    get active() {
        return this._active;
    }

    get tabs() {
        return this._model.tabs;
    }

    create({tabHtml, contentHtml, active=false}) {
        let id = this._name + ++this._id;
        
        let content = "div"
            .createElement(id, contentHtml)
            .data("id", this._id)
            .addClass("tab-content");
        this._contentCreated(
            this._toggleContent(content, active).appendTo(this._model.content)
        );

        let tab = "span"
            .createElement(id, tabHtml)
            .addClass("tab")
            .data("content-ref", content)
            .data("id", this._id)
            .on("click", e => this._tabClick(e));
        this._tabCreated(
            this._toggleTab(tab, active).appendTo(this._model.tabs)
        );

        if (active) {
            this._active = tab;
        }
        return this;
    }

    closeByTab(tab) {
        let content = tab.data("content-ref");
        tab.remove();
        content.remove();
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
            this._reveal(lowest);
        }
    }

    activate(tab) {
        if (tab.data("active")) {
            return this;
        }
        this._toggle(this._active, false);
        this._toggle(tab, true);
        this._active = tab;
        return this;
    }

    _reveal(tab) {
        if (!this.tabs.overflownX()) {
            return
        }
        //
        // If tab is in offset, scroll tabs to start posotion. Assuming first tab is awlays most left (no dragging yet)
        //
        let r = tab.getClientRects();
        if (r[0].x - tab.offsetWidth < this.tabs.scrollLeft) {
            this.tabs.scrollLeft = 0;
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