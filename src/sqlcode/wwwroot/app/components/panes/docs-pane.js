define(["sys/model",], Model => {

    const template = String.html`
        <div class="panel-header panel-header-b">
            <div class="panel-title noselect">SCRIPTS</div>
            <div class="panel-title-btns">
                <span id="addbtn" class="btn" title="Add new script (Ctrl+N)">&#10133;</span>
            </div>
        </div>
        <div id="content" class="panel-content">
            <div class="shadow-line"></div>
            <div class="panel-item">
                <span>&#11208;</span>
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
    `;

    return container => {
        const 
            model = new Model().bind(container.html(template));

        model.addbtn.on("click", e => _app.pub("docs/create", e.target));
        

    }
    
});