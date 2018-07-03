define([
    "sys/model",
    "sys/html",
    "controls/monaco-menu",
    "controls/inline-editor",
    "services/script-service",
    "components/pane-filter"
], (
    Model, 
    html,
    Menu, 
    InlineEditor, 
    service,
    Filter
) => {

    var model, filter;

    const 
        scriptsType = "pgsql",
        paneTemplate = String.html`
            <div class="panel-header noselect">
                <div class="panel-title">
                    SCRIPTS
                    <span id="info"></span>
                </div>
                
                <div class="panel-commands">
                    <button id="newBtn" title="Create new script (Ctrl+N)" class="control">new</button>
                    <button id="filterBtn" title="Filter scripts (Ctrl+?)" class="control">filter</button>
                    <input id="inputFilter" type="text" autocorrect="off" autocapitalize="off" spellcheck="false">
                </div>
                
            </div>
            <div id="shadow" class="panel-shadow-line" style="display: none;"></div>
            <div id="content" class="panel-content noselect">
            </div>`;

    const
        dirEnum = Object.freeze({right: "&#11208;",  down: "&#11206;"});

    const
        item = (title, dir="right") => html.strToElement(
            String.html`
                <div class="panel-item">
                    <div class="expand" data-dir="${dir}" title="${dir === "right" ? "expand" : "collapse"}">
                        ${dirEnum[dir]}
                    </div>
                    <div class="item">
                        <span class="icon icon-doc-text"></span>
                        <span class="title editable"
                            contenteditable="false" autocorrect="off" 
                            autocapitalize="off" spellcheck="false" autocomplete="off"
                            title="${title}">${title}
                        </span>
                    </div>
                    <div class="details" ${dir === "right" ? "style='display: none'" : ""}>
                        empty
                    </div>
                </div>`
            );

    const
        activate = (item1, state) => {
            if (!item1.length) {
                return;
            }
            item1.toggleClass("active", state);
            if (state) {
                item1.scrollIntoView({ behavior: "instant", block: "end", inline: "end" });
            }
        };

    const
        scriptNamesRepo = {
            _scripts: {},
            add: (id, title, unnamed = true) =>
                scriptNamesRepo._scripts[id] = { title: title, unnamed: unnamed },
            getUnnamed: () => Object.values(scriptNamesRepo._scripts).filter(obj => obj.unnamed).map(obj => obj.title),
            set: (id, title) => {
                scriptNamesRepo._scripts[id].title = title;
                scriptNamesRepo._scripts[id].unnamed = false;
            },
            total: () => Object.keys(scriptNamesRepo._scripts).length
        };

    const
        activateByElement = element => {
            element.focus();
            activate(element, true);
            _app.pub("scripts/selected", {
                id: element.data("id"), 
                type: scriptsType, 
                title: element.data("title"),
                dontFocus: true
            });
        };

    const
        expand = (element, dir) => {
            element
                .data("dir", dir)
                .html(dirEnum[dir])
                .attr("title", (dir === "right" ? "expand" : "collapse"));
            element.parentElement.find(".details").show(dir !== "right");
        };

    const
        createItem = (id, title) => {

            const
                element = item(title)
                .data("id", id)
                .data("title", title)
                .addClass(`item-${id}`)
                .attr("tabindex", id);

            const
                menu = new Menu({
                    id: "scripts-pane-item-menu",
                    target: element,
                    items: [
                        { text: "Reveal", action: () => activateByElement(element) },
                        { splitter: true },
                        {
                            id: "rename", text: "Rename", keyBindings: "dblclick, F2", args: { element: element }, action: args => {
                                service.getNames(scriptsType).then(response => {
                                    
                                    const inline = new InlineEditor({
                                        element: args.element.find(".title"),
                                        values: response.data || [],
                                        acceptArgs: { id: element.data("id"), element: element },
                                        onaccept: (newContent, args1) => {
                                            service.updateTitle(args1.id, scriptsType, newContent).then(response => {
                                                if (!response.ok) {
                                                    inline.editable();
                                                    inline.element.focus();
                                                    inline.setInvalid();
                                                    _app.pub("scripts/title/save/fail", {id: args1.id, type: scriptsType, title: newContent});// todo: alerts
                                                    return;
                                                }
                                                _app.pub("scripts/title/update", newContent, args1.id, scriptsType);
                                                scriptNamesRepo.set(args1.id, newContent);
                                                args1.element.data("title", newContent);
                                                if (model.filterBtn.data("state")) {
                                                    filter.execute();
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        },
                        { splitter: true },
                        { text: "Download", action: () => console.log("Download") }, //todo
                        { text: "Remove", action: () => console.log("Remove") } //todo
                    ],
                    contextmenuItems: items => {
                        const show = !element.hasClass("active");
                        items[0].element.show(show);
                        items[1].element.show(show);
                        return items;
                    }
                });
            
            element.find(".item")
                .on("click", () => {
                    if (element.hasClass("active")) {
                        return;
                    }
                    _app.pub("scripts/selected", {id: id, type: scriptsType, title: title, dontFocus: true});
                })
                .on("dblclick", () => {
                    _app.pub("scripts/keep-open", id, scriptsType);
                    menu.triggerById("rename", {element: element});
                });
            
            element.find(".expand").on("click", e => {
                const dir = e.target.data("dir") === "right" ? "down" : "right";
                expand(e.target, dir);
            });

            element.on("keydown", e => {
                if (InlineEditor.editing(element.find(".title"))) {
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
                    expand(element.find(".expand"), "down");

                } else if (e.key === "ArrowLeft") {
                    
                    // collapse ... todo
                    expand(element.find(".expand"), "right");

                } else if (e.key === "Tab" || e.key === "Enter") {
                    _app.pub("monaco/active-editor/focus");
                } else if (e.key === "F2") {
                    menu.triggerById("rename", {element: element});
                }
            });
            
            return element;
        };

    const
        updateShadowLine = () => {
            if (model.content.overflownY()) {
                model.shadow.css("display", "");
            } else {
                model.shadow.css("display", "none");
            }
        };
    
    const
        newItem = (id, title) => {
            let item = createItem(id, title);
            model.content.append(item);
            scriptNamesRepo.add(id, title);
            return item;
        };

    return container => {

        model = new Model().bind(container.html(paneTemplate));
        filter = new Filter({content: model.content, filterBtn: model.filterBtn, inputFilter: model.inputFilter});

        service.getItems(scriptsType).then(response => {
            if (!response.ok || !response.data) {
                _app.pub("scripts/alert/retreive-all/fail", scriptsType); // todo: alerts
            } else {
                for(let data of response.data) {
                    newItem(data.id, data.title);
                }

                // todo: script pane loaded...
            }
        });
        
        model.newBtn.on("click", e => {
            setTimeout(() => {
                const
                    getName = (n => n ? `New script ${n + 1}` : "New script"), 
                    unnamed = scriptNamesRepo.getUnnamed(),
                    suggestion = getName(unnamed.length);
                _app.pub("scripts/create", scriptNamesRepo.total() + 1, suggestion, scriptsType);
            }, 0);
        });
        filter.activate(false); // initial state for filter ctrl
        model.filterBtn.on("click", () => filter.toggle());
        
        _app
            .sub("editor/created/" + scriptsType, data => {
                newItem(data.editor.id, data.title);
                updateShadowLine();
                model.info = "created...";
                setTimeout(() => {
                    model.info = `total=${data.count}`;
                    setTimeout(() => model.info = "", 5000);
                }, 1000);
            })

            .sub(`editor/activated/${scriptsType}`, data => 
                activate(model.content.find(`.item-${data.id}`), data.state))

            .sub("editor/title/update", (title, id, type) => {
                if (scriptsType !== type) {
                    return;
                }
                model.content.find(`.item-${id}`)
                    .data("title", title)
                    .find(".title")
                    .attr("title", title)
                    .html(title);
            });

        window
            .on("resize", () => {
                model.content.css("height", (window.innerHeight - 60) + "px");
                updateShadowLine();
            })
            .trigger("resize");
    }

});
