define(["sys/model"], Model => class {

    constructor({container, name="", height=40, tabCreate=(()=>{})}) {
        let model = new Model().bind(
            container
                .css("display", "grid")
                .css("grid-template-rows", height + "px auto")
                .html(
                    String.html`
                        <div id="tabs" class="tabs"></div>
                        <div id="content" class="tabs-container" ></div>`
                )
        );
        this._tabs = model.tabs;
        this._content = model.content;
        this._id = 0;
        this._name = name
        this._tabCreate = tabCreate
    }

    create(tabHtml, contentHtml) {
        this._id++;
        let el = "span"
            .createElement(this._name + this._id, tabHtml)
            .addClass("tab");
        this._tabCreate(el);
        el.appendTo(this._tabs);
        return this;
    }

});
