define([], () => {

    const 
        template = String.html`
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
        

    return class {
        constructor({
            items,
            target=(()=>{throw "target is required"})(),
            contextmenuItems=items=>items,
        }) {
            let element = template.toElement(),
                container = element.find(".actions-container");
            if (items !== undefined) {
                for(let item of items) {
                    if (item.splitter) {
                        item.element = splitter.toElement();
                        continue;
                    } 
                    item.element = itemTemplate(item.text, item.keyBindings).toElement().on("click", () => {
                        item.action(item.args)
                    });
                }
            }
            document.body.append(element);
            target.on("contextmenu", e => {
                container.html("");
                for(let item of contextmenuItems(items)) {
                    container.append(item.element);
                }
                element.css("top", e.y + "px").css("left", e.x + "px").show();
                e.preventDefault();
            });
            element.on("click", () => element.hide());
            window.on("resize", () => element.hide())
            window.on("mousedown", () => {
                if (!element.find(":hover").length) {
                    element.hide();
                }
            }).on("keyup", e => {
                if (e.keyCode === 27) {
                    element.hide();
                }
            });
            this.triggerById = (id, args) => {
                for(let item of items) {
                    if (item.id === id) {
                        item.action(args);
                    }
                }
            };
            _app.sub("monaco/context-menu/open", () => element.hide())
        }
    }
});