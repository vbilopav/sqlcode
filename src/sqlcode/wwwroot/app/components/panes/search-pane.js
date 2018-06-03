define([], () => {

    return container => {
        container.html(
            String.html`
            <div class="panel-header">
                <div class="panel-title noselect">
                    SEARCH
                </div>
            </div>
            <div id="content" class="panel-content">
                    <div class="shadow-line"></div>
            </div>`
        );
    }
});