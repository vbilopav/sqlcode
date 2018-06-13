define([
    "sys/model",
    "controls/monaco-menu",
    "controls/inline-editor",
    "services/script-service"
], (
    Model, 
    Menu, 
    InlineEditor, 
    service
) => {

    var model;

    const 
        type = "pgsql",
        paneTemplate = String.html`
            <div class="panel-header noselect">
                <div class="panel-title">
                    SCRIPTS
                    <span id="info"></span>
                </div>
                
                <div class="panel-commands">
                    <button id="new" title="Create new script (Ctrl+N)" class="control">new</button>
                    <button id="filter" title="Filter scripts (Ctrl+?)" class="control">filter</button>
                </div>
                
            </div>
            <div id="shadow" class="panel-shadow-line" style="display: none;"></div>
            <div id="content" class="panel-content noselect">
            </div>`,

        dirEnum = Object.freeze({right: "&#11208;",  down: "&#11206;"}),

        item = (title, dir="right") => String.html`
            <div class="panel-item">
                <span class="expand" data-dir="${dir}">${dirEnum[dir]}</span>
                <span class="text">
                    <span class="icon icon-doc-text"></span>
                    <span class="panel-item-title editable"
                    contenteditable="false"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    autocomplete="off"
                    title="${title}">${title}</span>
                </span>
            </div>`.toElement(),

        activateByElement = element => {
            element.focus();
            activate(element, true);
            _app.pub("scripts/selected", {
                id: element.data("id"), 
                type: type, 
                title: element.data("title"),
                dontFocus: true
            });
        },

        updateItemTitle = (element, title) => {
            element.data("title", title).find(".text").attr("title", title).html(title);
        },

        createItem = (id, title) => {
            let element = item(title).data("id", id).data("title", title).addClass("item-" + id).attr("tabindex", id);
            
            element.find(".text")
                .on("click", () => {
                    if (element.hasClass("active")) {
                        return;
                    }
                    _app.pub("scripts/selected", {id: id, type: type, title: title, dontFocus: true});
                })
                .on("dblclick", () => _app.pub("scripts/keep-open", id, type));
            
            element.find(".expand").on("click", e => {
                let dir = e.target.data("dir") === "right" ? "down" : "right";
                e.target.data("dir", dir).html(dirEnum[dir]);
            });

            let menu = new Menu({
                id: "scripts-pane-item-menu",
                target: element, 
                items: [
                    {text: "Reveal", action: () => activateByElement(element)},
                    {splitter: true},
                    {id: "rename", text: "Rename", keyBindings: "dblclick, F2", args: {element: element}, action: args => 
                            new InlineEditor({
                                element: args.element.find(".panel-item-title"), 
                                getInvalidNamesCallback: () => service.getNames(type)
                            })
                    },
                    {splitter: true},
                    {text: "Download", action: ()=>console.log("Download")}, //todo
                    {text: "Remove", action: ()=>console.log("Remove")} //todo
                ],
                contextmenuItems: items => {
                    let show = !element.hasClass("active");
                    items[0].element.show(show);
                    items[1].element.show(show);
                    return items;
                }
            });

            element.on("keydown", e => {
                if (InlineEditor.editing(element.find(".panel-item-title"))) {
                    return;
                }
                if (e.key === "ArrowUp") {
                    let prev = element.previousSibling;
                    if (prev.nodeName === "#text") {
                        prev = model.content.lastChild;
                    }
                    activateByElement(prev);
                } else if (e.key === "ArrowDown") {
                    activateByElement(element.nextSibling || model.content.firstChild.nextElementSibling);
                } else if (e.key === "ArrowRight") {
                    
                    // expand ... todo

                } else if (e.key === "ArrowLeft") {
                    
                    // collapse ... todo

                } else if (e.key === "Tab" || e.key === "Enter") {
                    _app.pub("monaco/active-editor/focus");
                } else if (e.key === "F2") {
                    menu.triggerById("rename", {element: element});
                }
            })
            .on("dblclick", () => menu.triggerById("rename", {element: element}));
            
            return element;
        },

        updateShadowLine = () => {
            if (model.content.overflownY()) {
                model.shadow.css("display", "");
            } else {
                model.shadow.css("display", "none");
            }
        },

        activate = (item, state) => {
            if (!item.length) {
                return;
            }
            item.toggleClass("active", state);
            if (state) {
                item.scrollIntoView({behavior: "instant", block: "end", inline: "end"});
            }
        };

    const 
        scripts = [],
        scriptItem = (id, title, unnamed=true) => {
            return {id: id, title: title, unnamed: unnamed}
        };

    return container => {

        model = new Model().bind(container.html(paneTemplate));
        model.new.on("click", e => {
            setTimeout(() => {
                let getName = (n => n ? `New script ${n+1}` : "New script"), 
                unnamed = scripts.filter(s => s.unnamed),
                suggestion = getName(unnamed.length);
                _app.pub("scripts/create", scripts.length + 1, suggestion, type);
            }, 0);
        });
        
        _app
            .sub("editor/created/" + type, data => {
                let item = createItem(data.editor.id, data.title);
                model.content.append(item);
                scripts.push(scriptItem(data.editor.id, data.title));
                updateShadowLine();
                model.info = "created...";
                setTimeout(() => {
                    model.info = "total=" + data.count
                    setTimeout(() => model.info = "", 5000);
                }, 1000);
            })
            .sub("editor/activated/" + type, data => 
                activate(model.content.find(".item-" + data.id), data.state));

        window
            .on("resize", () => {
                model.content.css("height", (window.innerHeight - 60) + "px");
                updateShadowLine();
            })
            .trigger("resize");
    }

});