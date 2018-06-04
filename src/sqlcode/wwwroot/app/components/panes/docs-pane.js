define(["sys/model",], Model => {

    const 
        paneTemplate = String.html`
            <div class="panel-header panel-header-b">
                <div class="panel-title noselect">SCRIPTS</div>
                <div class="panel-title-btns">
                    <span id="addbtn" class="btn" title="Add new script (Ctrl+N)">&#10133;</span>
                </div>
            </div>
            <div class="panel-content">
                <div class="shadow-line"></div>
                <div id="content" class="docs-content">
                </div>
            </div>`,

        dir = Object.freeze({right: "&#11208;",  down: "&#11206;"}),

        item = title => String.html`
            <div class="panel-item">
                <span>&#11208;</span>
                <span class="icon icon-doc-text"></span>
                <span class="panel-item-title">${title}</span>
            </div>`.toElement();

    /*
            <div class="panel-item">
                <span>&#11208;</span> &#11206;
                <span class="icon icon-doc-text"></span>
                <span class="panel-item-title">Script 1 blah blah some text long text blah</span>
            </div>
            <div class="panel-item" style="background-color: #1E1E1E;">
                <span>&#11208;</span>
                <span class="icon icon-doc-text"></span>
                <span class="panel-item-title">Script 2</span>
            </div>
            <div class="panel-item">
                <span>&#11208;</span>
                <span class="icon icon-doc-text"></span>
                <span class="panel-item-title">Script 3</span>
            </div>
        </div>
    */

    return container => {
        const 
            model = new Model().bind(container.html(paneTemplate));

        model.addbtn
            .on("mousedown", e => e.target.css("font-weight", "900").css("font-size", "16px").data("up", true))
            .on("mouseup", e => {
                if (!e.target.data("up")) {
                    return;
                }
                e.target.css("font-weight", "").css("font-size", "");
                _app.pub("docs/create", e.target);
            });
        
        _app.sub("editor/created", title => {
            model.content.append(item(title));
        });
    }
    
});