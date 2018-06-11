define([], () => {

    const 
        element = String.html`
            <div class="vs-dark" style="display: none; position: fixed;">
                <div class="context-view monaco-menu-container" aria-hidden="false">
                    <div class="monaco-menu">
                        <div class="monaco-action-bar animated vertical">
                            <ul class="actions-container" role="menubar"></ul>
                        </div>
                    </div>
                </div>
            </div>`;

        itemTemplate = (text, keyBindings) => String.html`
            <li class="action-item" role="presentation">
                <a class="action-label" role="menuitem" tabindex="0">${text}</a>
                ${keyBindings ? '<span class="keybinding">' + keyBindings + '</span>' : ""}
            </li>`,

        splitter = String.html`
            <li class="action-item disabled" role="presentation">
                <a class="action-label icon separator disabled" role="presentation"></a>
            </li>`;
        

    class VerticalMonacoMenu {
        constructor({
            items=(()=>{throw "items are required"})(),
            target=(()=>{throw "target is required"})()
        }) {
            this.element = element.toElement();
            let container = this.element.find(".actions-container");
            for(let item of items) {
                if (item.splitter) {
                    container.append(splitter.toElement());
                    continue;
                } 
                let e = itemTemplate(item.text, item.keyBindings).toElement();
                container.append(e);
                e.on("click", item.click);
            }
            document.body.append(this.element);
            target.on("contextmenu", e => {
                _app.pubSync("monaco/context-menu/open");
                this.element.css("top", e.y + "px").css("left", e.x + "px").show();
                e.preventDefault();
            });
            window.on("resize mousedown", () => this.element.hide()).on("keyup", e => {
                if (e.keyCode === 27) {
                    this.element.hide();
                }
            });
            _app.sub("monaco/context-menu/open", () => this.element.hide())
        }
    }

    return VerticalMonacoMenu;
});