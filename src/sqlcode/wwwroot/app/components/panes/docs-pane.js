define(["sys/model",], Model => {

    return container => {
        new Model().bind(
            container.html(
                String.html`
                <div class="panel-header">
                    <div class="panel-title noselect">
                        <span id="add" class="panel-title-btn btn" title="Add new script (Ctrl+N)">
                            &#10133;
                        </span>
                        SCRIPTS
                    </div>
                </div>`
            )
        ).add.on("click", () => {
            console.log("Add new script");
        });
    }
    
});