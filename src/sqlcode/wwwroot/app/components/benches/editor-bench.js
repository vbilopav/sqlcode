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
                .on("dragenter", e => e.target.closest("."+name).addClass("droptarget"))
                .on("dragleave", e => e.target.closest("."+name).removeClass("droptarget"))
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
    };

    return container => {

        tabbed = new Tabbed({container, name: name});
        Editor.init(tabbed);
        
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
                let editor = event.content.data("editor-ref"),
                    args = mapEventToPubSub(event, editor);
                _app.pub(["editor/activated", "editor/activated/" + editor.type], args);
            }
        };

        tabbed.afterActivate = event => {
            let editor = event.content.data("editor-ref"),
                args = mapEventToPubSub(event, editor);
            if (event.state) {
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
            let {tab, content} = tabbed.create({
                tabHtml: tabTemplate(title),
                contentHtml: "",
                active: true
            });
            let editor = new Editor({id: id, title: title, container: content, tab: tab, type: type});
            tab.addClass(type + "-" + id);
            tabbed.revealActive();
            args = mapEventToPubSub({tab: tab, count: tabbed.tabCount}, editor);
            args.title = title;
            
            _app
                .pub(["editor/created", "editor/created/" + editor.type], args)
                .pub(["editor/activated", "editor/activated/" + editor.type], args);
        })
        .sub("scripts/selected", (id, type) => tabbed.activate(tabbed.tabs.find("." + type + "-" + id)));

        // inital state... load previous scripts here
        editorNoTabs();
    }
});