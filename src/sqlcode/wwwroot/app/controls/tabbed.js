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
        this._current = undefined
        for(let opts of tabs) {
            this.create(opts); 
        }
    }

    get current() {
        return this._current;
    }

    get tabs() {
        return this._model.tabs;
    }

    create({tabHtml, contentHtml, active=false}) {
        let id = this._name + this._id++;
        
        let content = "div"
            .createElement(id, contentHtml)
            .addClass("tab-content");
        this._contentCreated(
            this._toggleContent(content, active).appendTo(this._model.content)
        );

        let tab = "span"
            .createElement(id, tabHtml)
            .addClass("tab")
            .data("content-ref", content)
            .on("click", e => this._tabClick(e));
        this._tabCreated(
            this._toggleTab(tab, active).appendTo(this._model.tabs)
        );

        if (active) {
            this._current = content;
        }
        return this;
    }

    closeByTab(tab) {
        console.log("close tab");
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
    }

    _tabClick(e) {
        if (e.currentTarget.data("active")) {
            return
        }
        if (e.target.data("canceled")) {
            e.target.data("canceled", false);
            return
        }
        for(let tab of this._model.tabs.findAll(".tab")) {
            if (tab.data("active")) {
                this._toggle(tab, false);
            }
        }
        this._toggle(e.currentTarget, true);
    }

});
