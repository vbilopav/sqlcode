define([
    "controls/tabbed",
    "components/editor"
], (Tabbed, Editor) => {

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
            </button>`,
        name = "editor-tab";

    var 
        tabbed = null,
        tabRibbon = undefined;

    const
        editorNoTabs = () => {
            if (tabRibbon !== undefined && !tabRibbon) {
                return
            }
            tabRibbon = false;
            tabbed.tabs.hide();
        }
        editorHaveTabs = () => {
            if (tabRibbon) {
                return
            }
            tabRibbon = true;
            tabbed.tabs.show();
        },
        initializeTab = tab => {
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
                        tabNext = tab.nextElementSibling,
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
                .on("dblclick", e => tab.removeClass("sticky"))
                .find(".close")
                .on("click", e => {
                    e.target.data("canceled", true);
                    tabbed.closeByTab(tab);
                });

            /*
            tab.find(".title")
                .on("click", e => {
                    if (tab.data("active")) {
                        e.target.attr("contenteditable", "true");
                    }
                });
            */
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
        },
        createActiveNewTab = (id, title, type) => {
            let 
                {tab, content} = tabbed.create({
                    tabHtml: tabTemplate(title),
                    contentHtml: "",
                    active: true
                }),
                editor = new Editor({
                    id: id, 
                    container: content,
                    title: title,
                    type: type
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
                let editor = Editor.editorByContainer(e.content),
                    args = mapEventToPubSub(e, editor);
                _app.pub(["editor/activated", "editor/activated/" + editor.type], args);
            }
        };

        tabbed.afterActivate = event => {
            let editor = Editor.editorByContainer(event.content),
                args = mapEventToPubSub(event, editor);
            if (event.state && !event.dontFocus) {
                editor.focus();
            }
            _app.pub(["editor/activated", "editor/activated/" + editor.type], args);
        }

        _app.sub("sidebar/changed", () => {
            if (tabbed.active) {
                tabbed.reveal(tabbed.active);
            }
        })
        .sub("scripts/create", (id, title, type) => {
            let {tab, editor} = createActiveNewTab(id, title, type),
                scriptClass = type + "-" + id;

            tab.addClass(scriptClass).data("script-class", scriptClass).data("script-id", id).data("script-type", type);
            tabbed.revealActive();
            let args = mapEventToPubSub({tab: tab, count: tabbed.tabCount}, editor);
            args.title = title;
            args.state = true;
            _app
                .pub(["editor/created", "editor/created/" + type], args)
                .pub(["editor/activated", "editor/activated/" + type], args);
        })
        .sub("scripts/selected", ({id, type, title, dontFocus}) => {

            let tab = tabbed.tabs.find("." + type + "-" + id);
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
                let oldId = sticky.data("script-id");
                let oldType = sticky.data("script-type");
                _app.pub(["editor/activated", "editor/activated/" + oldType], {id: oldId, type: oldType, state: false});
            } else {
                let r = createActiveNewTab(id, title, type);
                sticky = r.tab;
                editor = r.editor;
                sticky.addClass("sticky");
            }
            let scriptClass = type + "-" + id;
            sticky.addClass(scriptClass).data("script-class", scriptClass).data("script-id", id).data("script-type", type);
            editor.restore(id, type);
            tabbed.activate(sticky);
            if (!dontFocus) {
                editor.focus();
            }
            _app.pub(["editor/activated", "editor/activated/" + type], {id: id, type: type, state: true});
        })
        .sub("scripts/keep-open", (id, type) => tabbed.tabs.find("." + type + "-" + id).removeClass("sticky"));

        // inital state... load previous scripts here
        editorNoTabs();
    }
});