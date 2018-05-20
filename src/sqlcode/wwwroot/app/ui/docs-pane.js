define([], () => {

    const content = String.html`
    <div class="panel-header">
        <div class="panel-title noselect">
            <span class="panel-title-btn btn" id="add" title="Add new script (Ctrl+N)">&#10133;</span>
            SCRIPTS
        </div>
    </div>
    `;

    return {
        init: ({container}) => {
            container.html(content).find("#add").on("click", () => {
                console.log("Add new script");
            })
        }
    }
});