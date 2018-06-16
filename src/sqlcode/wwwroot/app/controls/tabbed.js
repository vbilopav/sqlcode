define(["sys/model"], Model => {

    class Tabbed {
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

            this.beforeActivate = (()=>true);
            this.afterActivate = (()=>{});

            window.on("resize", () => {
                if (this.active) {
                    this.reveal(this.active);
                }
            })
        }

        static get _contentId() {
            return "content-ref";
        }

        static contentByTab(tab) {
            return tab.data(Tabbed._contentId);
        }

        get active() {
            return this._active;
        }

        get activeContent() {
            if (this._active) {
                return Tabbed.contentByTab(this._active);
            }
        }

        get tabs() {
            return this._model.tabs;
        }

        get tabCount() {
            return this._count;
        }

        get nextId() {
            return this._id + 1;
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

            let tab = "div"
                .createElement(id, tabHtml)
                .addClass("tab")
                .data(Tabbed._contentId, content)
                .data("id", this._id)
                .on("click", e => this._tabClick(e));
            
            let eventArgs = this._getEventArgs(tab, content);
            eventArgs.active = active;
            if (!this.beforeCreate(eventArgs)) {
                this._id--;
                this._count--;
                return;
            }

            this._toggleContent(content, active).appendTo(this._model.content);
            this._toggleTab(tab, active).appendTo(this._model.tabs)

            if (active) {
                if (this._active) {
                    this._toggle(this._active, false);
                }
                this._active = tab;
            }
            this.afterCreate(eventArgs);
            return {tab, content};
        }

        closeByTab(tab) {
            let content = Tabbed.contentByTab(tab),
                eventArgs = this._getEventArgs(tab, content);
            if (!this.beforeClose(eventArgs)) {
                return;
            }
            tab.remove();
            content.remove();
            this._count--;
            eventArgs.count = this._count;
            eventArgs.state = false;
            this.afterClose(eventArgs);
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

        activate(tab, args={}) {
            if (tab.data("active")) {
                return this;
            }
            this._toggle(this._active, false, args);
            this._toggle(tab, true, args);
            this._active = tab;
            this.reveal(tab);
            return this;
        }

        revealActive() {
            this.reveal(this._active);
        }

        reveal(tab) {
            if (!this.tabs.overflownX()) {
                return
            }
            let tabRect = tab.getClientRects(),
                tabsRect = this.tabs.getClientRects();
            if (tabRect[0].left < tabsRect[0].left) {
                tab.scrollIntoView({behavior: "instant", block: "start", inline: "start"})
            }
            if (tabRect[0].left + tabRect[0].width > tabsRect[0].left + tabsRect[0].width) {
                tab.scrollIntoView({behavior: "instant", block: "end", inline: "end"});
            }
        }

        _getEventArgs(tab, content) {
            return {
                id: tab.data("id"),
                active: tab.data("active"),
                tab: tab, 
                content: content, 
                count: this._count
            }
        }

        _toggleTab(tab, active) {
            return tab
                .toggleClass("tab-active", active)
                .toggleClass("tab-inactive", !active)
                .data("active", active);
        }

        _toggleContent(content, active) {
            return content
                .toggleClass("tab-content-active", active)
                .toggleClass("tab-content-inactive", !active)
                .data("active", active)
                .show(active);
        }

        _toggle(tab, state, args={}) {
            let content = Tabbed.contentByTab(tab),
                eventArgs = Object.assign(this._getEventArgs(tab, content), args);
            eventArgs.state = state;
            if (!this.beforeActivate(eventArgs)) {
                return this;
            }
            this._toggleTab(tab, state);
            this._toggleContent(content, state);
            this.afterActivate(eventArgs);
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
    }

    return Tabbed;
});
