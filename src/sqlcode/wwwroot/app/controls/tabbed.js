define(["sys/model"], Model => class {

    constructor({
        container, 
        name="", 
        height=40, 
        tabCreate=(()=>{}),
        tabs=[]
    }) {
        this.model = new Model().bind(
            container
                .css("display", "grid")
                .css("grid-template-rows", height + "px auto")
                .html(
                    String.html`
                        <div id="tabs" class="tabs"></div>
                        <div id="content" class="tabs-container" ></div>`
                )
        );
        this._id = 0;
        this._name = name;
        this._tabCreate = tabCreate;
        for(let t of tabs) {
            this.create(t) 
        }
    }

    create({tabHtml, contentHtml}) {
        let id = this._name + this._id++;
        let tab = "span"
            .createElement(this._name + this._id, tabHtml)
            .addClass("tab");
        this._tabCreate(tab);
        tab.appendTo(this.model.tabs);

        //...
        return this;
    }

});
