define([], () => {

    const content = String.html`
    <div class="panel-header">
        <div class="panel-title noselect">
            SEARCH
        </div>
    </div>
    `;

    return {
        init: ({container}) => {
            container.html(content);
        }
    }
});