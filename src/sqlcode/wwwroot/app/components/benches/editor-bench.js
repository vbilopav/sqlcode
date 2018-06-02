define(["controls/tabbed"], Tabbed => {

    const 
        tabTmplt = title => String.html`
            <span class="icon icon-doc-text"></span>
            <span class="title editable" 
                contenteditable="false" 
                autocorrect="off" 
                autocapitalize="off" 
                spellcheck="false" 
                autocomplete="off">${title}</span>
            <span class="close" title="Close (Ctrl+F4)">&#10006;</span>
        `,
        cls = "editor-tab";
        
    var 
        tabbed = null,
        tabRibbon = undefined,
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
            tab.addClass(cls)
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
                .on("dragenter", e => e.target.closest("."+cls).addClass("droptarget"))
                .on("dragleave", e => e.target.closest("."+cls).removeClass("droptarget"))
                .find(".close")
                .on("mousedown", e => e.target.css("font-weight", "900").css("font-size", "12px").data("up", true))
                .on("mouseup", e => {
                    if (!e.target.data("up")) {
                        return;
                    }
                    e.target.data("canceled", true).css("font-weight", "").css("font-size", "");
                    tabbed.closeByTab(tab);
                });
            tab.find(".title")
                .on("click", e => {
                    if (tab.data("active")) {
                        e.target.attr("contenteditable", "true");
                    }
                });
        }

    return container => {

        tabbed = new Tabbed({container, name: "editor-tab"});

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
            }
        };

        _app.sub("sidebar/changed", () => {
            if (tabbed.active) {
                tabbed.reveal(tabbed.active);
            }
        });

        _app.sub("docs/create", () => {
            let c = tabbed.tabCount + 1;
            tabbed.create({
                tabHtml: tabTmplt("new script " + c),
                contentHtml: String.html`<span style="margin: 50px">content ${c}.</span>`,
                active: true
            }).revealActive();
        });

        editorNoTabs();
    }
});