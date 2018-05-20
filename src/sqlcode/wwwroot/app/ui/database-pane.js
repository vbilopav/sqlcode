define([], () => {

    const content = String.html`
    <div class="panel-header">
        <div class="panel-title noselect">
            DATABASE EXPLORER
        </div>
    </div>
    `;

    return {
        init: ({container}) => {
            container.html(content);
        }
    }
});