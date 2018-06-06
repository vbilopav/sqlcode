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
        }

    return container => {

        tabbed = new Tabbed({container, name: name});
        Editor.setTabControl(tabbed);
        
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
            _app.pub("editor/created", {
                title: event.tab.find(".title").html(), 
                id: event.id,
                count: event.count
            })
            .pub("editor/activated", {
                id: event.id,
                state: event.active
            });
        };
        tabbed.afterClose = e => {
            if (e.count === 0) {
                editorNoTabs();
                _app.pub("editor/activated", {
                    id: e.id,
                    state: false
                });
            }
        };

        tabbed.afterActivate = event => {
            _app.pub("editor/activated", {
                id: event.id,
                state: event.state
            });
        }

        _app.sub("sidebar/changed", () => {
            if (tabbed.active) {
                tabbed.reveal(tabbed.active);
            }
        })
        .sub("docs/create", () => {
            let c = tabbed.nextId;
            let {tab, content} = tabbed.create({
                tabHtml: tabTemplate("New script " + c),
                contentHtml: "",
                active: true
            })
            
            tabbed.revealActive();
            if (content) {
                //!!!!
                new Editor(content);
            }
        })
        .sub("docs/selected", id => tabbed.activate(tabbed.tabs.find("#" + name + id)));

        editorNoTabs();
    }
});