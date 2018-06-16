define([], () => {

    const 
        template = id => String.html`
            <div id="${id}" class="vs-dark" style="display: none; position: absolute;">
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
            id=(()=>{throw "id is required"})(),
            items=[],
            target=(()=>{throw "target is required"})(),
            contextmenuItems=items=>items,
        }) {
            let element = document.body.find("#" + id);
            if (!element.length) {
                element = element = template(id).toElement();
                document.body.append(element);
            }
            
            let 
                container = element.find(".actions-container"),
                clear = () => {
                    element.hide();
                    container.html("");
                };

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

            element.on("click", () => clear());
            window.on("resize", () => clear());

            window.on("mousedown", () => {
                if (!element.find(":hover").length) {
                    clear();
                }
            }).on("keyup", e => {
                if (e.keyCode === 27) {
                    clear();
                }
            });

            this.triggerById = (id, args) => {
                for(let item of items) {
                    if (item.id === id) {
                        item.action(args);
                    }
                }
            };

            target.on("contextmenu", e => {
                container.html("");
                for(let item of contextmenuItems(items)) {
                    container.append(item.element);
                }
                element.css("top", e.y + "px").css("left", e.x + "px").show();
                let rect = container.getBoundingClientRect(),
                    winWidth = window.innerWidth,
                    winHeight = window.innerHeight,
                    right = e.x + rect.width,
                    bottom = rect.top + rect.height;
                
                if (right >= winWidth) {
                    element.css("left", (winWidth - rect.width - 1) + "px");
                }
                if (bottom >= winHeight) {
                    element.css("top", (e.y - rect.height - 1) + "px");
                }
                e.preventDefault();
            });

            _app.sub("monaco/context-menu/open", () => clear())
        }
    }
});
