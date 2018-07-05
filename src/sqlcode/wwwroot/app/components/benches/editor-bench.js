define([
    "controls/tabbed",
    "components/editors/script-editor",
    "controls/monaco-menu",
    "components/editors/script-title-editor"
], (
    Tabbed, 
    Editor, 
    Menu, 
    TitleEditor
) => {

    var 
        tabbed = null,
        tabRibbon = undefined;
    
    const
        name = "editor-tab";

    const 
        tabTemplate = title => String.html`
            <span class="icon icon-doc-text"></span>
            <span class="title editable"
                contenteditable="false"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                autocomplete="off"
                title="${title}">
                    ${title}
            </span>
            <button class="close" title="Close (Ctrl+F4)">
                &#10006;
            </button>`;

    const
        editorNoTabs = () => {
            if (tabRibbon !== undefined && !tabRibbon) {
                return;
            }
            tabRibbon = false;
            tabbed.tabs.hide();
        };

    const
        editorHaveTabs = () => {
            if (tabRibbon) {
                return;
            }
            tabRibbon = true;
            tabbed.tabs.show();
        };

    const
        initializeTab = tab => {
            const
                title = tab.find(".title"),
                menu = new Menu({
                    id: "editor-bench-tab-menu",
                    target: tab,
                    items: [
                        {
                            id: "close", text: "Close", keyBindings: "Ctrl+F4", args: {tab: tab}, action: args => tabbed.closeByTab(args.tab)
                        },
                        {
                            text: "Close Others", action: () => {
                                for(let t of tabbed.tabs.findAll("." + name)) {
                                    if (t.id !== tab.id) {
                                        tabbed.closeByTab(t);
                                    }
                                }
                            }
                        },
                        {
                            text: "Close All", action: () => {
                                for(let t of tabbed.tabs.findAll("." + name)) {
                                    tabbed.closeByTab(t);
                                }
                            }
                        },
                        { splitter: true },
                        {
                            id: "rename", 
                            text: "Rename", 
                            keyBindings: "F2", 
                            args: {title: title, tab: tab}, 
                            action: args => {
                                new TitleEditor({
                                    element: args.title, 
                                    id: args.tab.data("script-id"), 
                                    type: args.tab.data("script-type"), 
                                    onaccept: e => _app.pub("editor/title/update", e.newContent, e.id, e.type)
                                });
                            }
                        },
                        { id: "split", splitter: true },
                        {
                            id: "keep-open", text: "Keep Open", keyBindings: "dblclick, Ctrl+K", args: {tab: tab}, action: args => args.tab.removeClass("sticky")
                        }
                    ],
                    contextmenuItems: items => {
                        const sticky = tab.hasClass("sticky");
                        items.filter(i => i.id === "split")[0].element.show(sticky);
                        items.filter(i => i.id === "keep-open")[0].element.show(sticky);
                        return items;
                    }
                });

            tab
                .addClass(name)
                .attr("draggable", "true")
                .on("dragstart", e => {
                    tabbed.activate(e.target);
                    e.dataTransfer.setData("tab-id", e.target.id);
                })
                .on("drop", e => {
                    e.preventDefault();
                    let
                        replace = tabbed.tabs.find("#" + e.dataTransfer.getData("tab-id")),
                        replaceNext = replace.nextElementSibling,
                        tabNext = tab.nextElementSibling;
                    const
                        switchTab = () => {
                            if (tabNext) {
                                tabbed.tabs.insertBefore(replace, tabNext);
                            } else {
                                tabbed.tabs.append(replace);
                            }
                        },
                        switchReplace = () => {
                            if (replaceNext) {
                                tabbed.tabs.insertBefore(tab, replaceNext);
                            } else {
                                tabbed.tabs.append(tab);
                            }
                        }

                    replace.remove();
                    tab.removeClass("droptarget").remove();

                    if (replaceNext && replaceNext.id === tab.id) {
                        replaceNext = tabNext;
                    } else if (tabNext && tabNext.id === replace.id) {
                        tabNext = replaceNext;
                        switchTab();
                        switchReplace();
                        return;
                    }
                    switchReplace();
                    switchTab();
                })
                .on("dragover", e => e.preventDefault())
                .on("dragenter", e => e.target.closest("." + name).addClass("droptarget"))
                .on("dragleave", e => e.target.closest("." + name).removeClass("droptarget"))
                .on("dblclick", () => {
                    if (tab.hasClass("sticky")) {
                        menu.triggerById("keep-open", {tab: tab});
                    } 
                    Editor.editorByContainer(Tabbed.contentByTab(tab)).focus();
                })
                .on("keydown", e => {
                    if (TitleEditor.editing(title)) {
                        return;
                    }
                    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                        tabbed.activate(tab.nextSibling || tabbed.tabs.firstChild, {dontFocus: true, focusTab: true});
                    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                        tabbed.activate(tab.previousSibling || tabbed.tabs.lastChild, {dontFocus: true, focusTab: true});
                    } else if (e.key === "Tab" || e.key === "Enter") {
                        e.preventDefault();
                        Editor.editorByContainer(tabbed.activeContent).focus();
                    } else if (e.key === "F2") {
                        menu.triggerById("rename", {title: title, tab: tab});
                    }
                })
                .find(".close")
                .on("click", e => {
                    e.target.data("canceled", true);
                    menu.triggerById("close", {tab: tab});
                });
        };

    const
        updateTabData = (tab, type, id) => {
            const scriptClass = type + "-" + id;
            tab
                .addClass(scriptClass)
                .data("script-class", scriptClass)
                .data("script-id", id).data("script-type", type)
                .attr("tabindex", id);
        };

    const
        mapEventToPubSub = (event, editor) => {
            return {
                tab: event.tab, 
                count: event.count, 
                editor: editor, 
                state: event.state, 
                id: (editor ? editor.id : null), 
                type: (editor ? editor.type : null)
            }
        };

    const
        createActiveNewTab = (id, title, type, existing=false) => {
            const 
                {tab, content} = tabbed.create({
                    tabHtml: tabTemplate(title),
                    contentHtml: "",
                    active: true
                }),
                editor = new Editor({
                    id: id, 
                    container: content,
                    title: title,
                    type: type,
                    existing: existing
                });
            return {tab, editor};
        }

    return container => {

        tabbed = new Tabbed({container, name: name});
        Editor.init(() => tabbed.activeContent);
        
        tabbed.tabs
            .addClass("editor-tabs")
            .on("mouseleave", () => tabbed.tabs.css("overflow", "hidden").css("overflow-x", "hidden"))
            .on("mouseenter", () => {
                if (tabbed.tabs.overflownX()) {
                    tabbed.tabs.css("overflow-x", "scroll");
                }
            });
        tabbed.afterCreate = event => {
            if (event.count !== 0) {
                editorHaveTabs();
            }
            initializeTab(event.tab);
        };
        tabbed.afterClose = e => {
            if (e.count === 0) {
                editorNoTabs();
                const
                    editor = Editor.editorByContainer(e.content),
                    args = mapEventToPubSub(e, editor);
                _app.pub(["editor/activated", "editor/activated/" + editor.type], args);
                editor.dispose();
            }
        };

        tabbed.beforeClose = event => {
            let editor = Editor.editorByContainer(event.content);
            editor.saveAll();
            return true;
        };

        tabbed.afterActivate = event => {
            const
                editor = Editor.editorByContainer(event.content);
            if (event.state && !event.dontFocus) {
                editor.focus();
            }
            if (event.state && event.focusTab) {
                event.tab.focus();
            }
            _app.pub(["editor/activated", "editor/activated/" + editor.type], 
                mapEventToPubSub(event, editor));
        };

        _app.sub("sidebar/changed", () => {
            if (tabbed.active) {
                tabbed.reveal(tabbed.active);
            }
        })
        .sub("scripts/create", (id, title, type) => {
            const {tab, editor} = createActiveNewTab(id, title, type);
            updateTabData(tab, type, id);
            tabbed.revealActive();
            const args = mapEventToPubSub({tab: tab, count: tabbed.tabCount}, editor);
            args.title = title;
            args.state = true;
            editor.focus();
            _app
                .pub(["editor/created", "editor/created/" + type], args)
                .pub(["editor/activated", "editor/activated/" + type], args);
        })
        .sub("scripts/selected", ({id, type, title, dontFocus}) => {

            const tab = tabbed.tabs.find(`.${type}-${id}`);
            if (tab.length) { 
                tabbed.activate(tab, {dontFocus: dontFocus});
                return;
            }
            let 
                editor,
                sticky = tabbed.tabs.find(".sticky");

            if (sticky.length) {
                sticky.removeClass(sticky.data("script-class"));
                editor = Editor.editorByContainer(Tabbed.contentByTab(sticky));
                sticky.find(".title").attr("title", title).html(title);
                const 
                    oldId = sticky.data("script-id"), 
                    oldType = sticky.data("script-type");
                _app.pub(["editor/activated", `editor/activated/${oldType}`], {
                    id: oldId, type: oldType, state: false, tab: sticky
                });
                editor.saveAll();
            } else {
                const r = createActiveNewTab(id, title, type, true);
                sticky = r.tab;
                editor = r.editor;
                sticky.addClass("sticky");
            }
            updateTabData(sticky, type, id);
            editor.restore(id, type, () => tabbed.activate(sticky, {dontFocus: dontFocus}));

            if (!dontFocus) {
                editor.focus();
            }
            _app.pub(["editor/activated", `editor/activated/${type}`], {
                id: id, type: type, state: true, tab: sticky
            });
        })
        .sub("scripts/keep-open", (id, type) => tabbed.tabs.find(`.${type}-${id}`).removeClass("sticky"))
        .sub("scripts/title/update", (title, id, type) => 
            tabbed.tabs.find("." + type + "-" + id).find(".title").attr("title", title).html(title));

        window.on("beforeunload", () => {
            active = Editor.editorByContainer(tabbed.activeContent);
            if (active) {
                active.saveAll();
            }
        });

        // inital state... load previous scripts here
        editorNoTabs();
    }
});