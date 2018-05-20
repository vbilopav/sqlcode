define([], () => {

    const content = String.html`
    <div class="panel-header">
        <div class="panel-title noselect">
            SCRIPTS
            <span class="panel-title-btn btn" id="add" title="Add new script (Ctrl+N)">&#10133;</span>
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