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
        item = (title, dir="right") => String.html`
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
            </div>`.toElement();

    const 
        scriptNamesRepo = {
            _scripts: {},
            add: (id, title, unnamed=true) => 
                scriptNamesRepo._scripts[id] = {title: title, unnamed: unnamed},
            getUnnamed: () => 
                Object.values(scriptNamesRepo._scripts).filter(obj => obj.unnamed).map(obj => obj.title),
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
            let element = item(title)
                .data("id", id)
                .data("title", title)
                .addClass("item-" + id)
                .attr("tabindex", id);
            
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
                let dir = e.target.data("dir") === "right" ? "down" : "right";
                expand(e.target, dir);
            });

            let menu = new Menu({
                id: "scripts-pane-item-menu",
                target: element, 
                items: [
                    {text: "Reveal", action: () => activateByElement(element)},
                    {splitter: true},
                    {id: "rename", text: "Rename", keyBindings: "dblclick, F2", args: {element: element}, action: args => 
                            new InlineEditor({
                                element: args.element.find(".title"), 
                                getInvalidNamesCallback: () => service.getNames(scriptsType),
                                acceptArgs: {id: element.data("id"), element: element},
                                onaccept: (newContent, args) => {
                                    _app.pub("scripts/title/update", newContent, args.id, scriptsType);
                                    scriptNamesRepo.set(args.id, newContent);
                                    args.element.data("title", newContent);
                                    if (model.filterBtn.data("state")) {
                                        executeFilter();
                                    }
                                }
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
        activate = (item, state) => {
            if (!item.length) {
                return;
            }
            item.toggleClass("active", state);
            if (state) {
                item.scrollIntoView({behavior: "instant", block: "end", inline: "end"});
            }
        };

    var
        filterTimeout;

    const
        activeFilter = state => {
            if (state === true) {
                model.filterBtn.css("border-style", "inset").data("state", state);
                model.inputFilter.visible(true).setFocus().select();
                executeFilter();
                model.inputFilter.on("keyup", () => {
                    if (filterTimeout) {
                        clearTimeout(filterTimeout);
                    } 
                    filterTimeout = setTimeout(executeFilter, 250);
                });
            } else if (state === false) {
                model.filterBtn.css("border-style", "").data("state", state);
                model.inputFilter.visible(false);
                clearFilter();
                model.inputFilter.off("keyup");
            } else if (state === undefined) {
                return model.filterBtn.data("state");
            }
        };

    const
        toggleFilter = () => activeFilter(!model.filterBtn.data("state"));

    const
        executeFilter = () => {
            let val = model.inputFilter.value.trim().toLowerCase();
            if (val === "") {
                clearFilter();
                return;
            }
            for(let item of model.content.findAll(".panel-item")) {
                let titleElement = item.find(".title"),
                    title = item.data("title"),
                    valIndex = title.toLowerCase().indexOf(val);
                
                if (valIndex !== -1) {
                    item.show();
                    let segment = title.substring(valIndex, valIndex + val.length),
                        newTitle = title.substring(0, valIndex) + 
                            "<span class='selected'>" + 
                            segment + 
                            "</span>" + 
                            title.substring(valIndex + val.length, title.length);
                    titleElement.html(newTitle);
                } else {
                    item.hide();
                    titleElement.html(item.data("title"));
                }
            }
        };

    const
        clearFilter = () => {
            for(let item of model.content.findAll(".panel-item")) {
                item.show().find(".title").html(item.data("title"));
            }
        }

    return container => {

        model = new Model().bind(container.html(paneTemplate));
        model.newBtn.on("click", e => {
            setTimeout(() => {
                let getName = (n => n ? `New script ${n+1}` : "New script"), 
                    unnamed = scriptNamesRepo.getUnnamed(),
                    suggestion = getName(unnamed.length);
                _app.pub("scripts/create", scriptNamesRepo.total() + 1, suggestion, scriptsType);
            }, 0);
        });
        activeFilter(false); // initial state for filter ctrl
        model.filterBtn.on("click", () => toggleFilter());
        
        _app
            .sub("editor/created/" + scriptsType, data => {
                let item = createItem(data.editor.id, data.title);
                model.content.append(item);
                scriptNamesRepo.add(data.editor.id, data.title);
                updateShadowLine();
                model.info = "created...";
                setTimeout(() => {
                    model.info = "total=" + data.count
                    setTimeout(() => model.info = "", 5000);
                }, 1000);
            })

            .sub("editor/activated/" + scriptsType, data => 
                activate(model.content.find(".item-" + data.id), data.state))

            .sub("editor/title/update", (title, id, type) => {
                if (scriptsType !== type) {
                    return;
                }
                model.content.find(".item-" + id)
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
