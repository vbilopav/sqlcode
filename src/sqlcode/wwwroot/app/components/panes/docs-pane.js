define(["sys/model",], Model => {

    return container => {
        new Model().bind(
            container.html(
                String.html`
                <div class="panel-header panel-header-b">
                    <div class="panel-title noselect">
                        SCRIPTS
                    </div>
                    <div class="panel-title-btns">
                        <span id="add" class="btn" title="Add new script (Ctrl+N)">&#10133;</span>
                    </div>
                </div>`
            )
        ).add.on("click", () => {
            console.log("Add new script");
        });
    }
    
});