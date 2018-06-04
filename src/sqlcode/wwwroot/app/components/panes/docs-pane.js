define(["sys/model",], Model => {

    const 
        paneTemplate = String.html`
            <div class="panel-header noselect">
                <div class="panel-title">
                    SCRIPTS
                    <span id="count">count=20</span>
                </div>
                
                <div class="panel-commands">
                    <button id="new" title="Create new script (Ctrl+N)" class="control">new</button>                    
                    <!--
                    <button id="filter" title="Filter script view" class="control">filter</button>
                    <button id="clear" class="control">clear</button>
                    <button id="download" class="control">download</button>
                    -->
                </div>
                
            </div>
            <div id="content" class="panel-content noselect">
                <div class="panel-shadow-line"></div>
            </div>`,

        dir = Object.freeze({right: "&#11208;",  down: "&#11206;"}),

        item = title => String.html`
            <div class="panel-item">
                <span>&#11208;</span>
                <span class="icon icon-doc-text"></span>
                <span class="panel-item-title">${title}</span>
            </div>`.toElement();

    return container => {

        const model = new Model().bind(container.html(paneTemplate));
        
        model.new.on("click", e => _app.pub("docs/create", e.target));
        _app.sub("editor/created", data => {
            let element = item(data.title)
            element.data("id", data.id).addClass("item-" + data.id);
            model.content.append(element)
        });
        _app.sub("editor/activated", data => {
            model.content.findAll(".panel-item.active").removeClass("active");
            model.content.find(".item-" + data.id).addClass("active");
        });
        window
            .on("resize", () => model.content.css("height", (window.innerHeight - 60) + "px"))
            .trigger("resize");
    }

});