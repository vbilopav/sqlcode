define(["controls/tabbed"], Tabbed => {

    const 
        tabTmplt = title => String.html`
            <span class="icon icon-doc-text"></span>
            <span class="title">${title}</span>
            <span class="close" title="Close (Ctrl+F4)">&#10006;</span>
        `,
        cls = "editor-tab";

    return container => {

        const 
            tabCreated = tab => tab
                .addClass(cls)
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
                        return
                    }
                    switchReplace();
                    switchTab();
                })
                .on("dragover", e => e.preventDefault())
                .on("dragenter", e => e.target.closest("."+cls).addClass("droptarget"))
                .on("dragleave", e => e.target.closest("."+cls).removeClass("droptarget"))
                .find(".close")
                .on("mousedown", e => e.target.css("font-weight", "900").data("up", true))
                .on("mouseup", e => {
                    if (!e.target.data("up")) {
                        return;
                    }
                    e.target.data("canceled", true);
                    e.target.css("font-weight", "");
                    tabbed.closeByTab(tab);
                }),
            tabbed = 
                new Tabbed({
                    container, 
                    name: "editor-tab", 
                    tabCreated: tabCreated,
                    tabs: [{
                            tabHtml: tabTmplt("vedran@vedran-ThinkPad-L570:~/Documents/vs/sqlcode/src/sqlcode/wwwroot$ http-server"),
                            contentHtml: String.html`<span style="margin: 50px">content1</span>` 
                        }, {
                            tabHtml: tabTmplt("script 2"),
                            contentHtml: String.html`<span style="margin: 50px">content2</span>` 
                        }, {
                            tabHtml: tabTmplt("script 3"),
                            contentHtml: String.html`<span style="margin: 50px">content3</span>` ,
                            active: true
                        }, {
                            tabHtml: tabTmplt("script 4"),
                            contentHtml: String.html`<span style="margin: 50px">content4</span>` 
                        }, {
                            tabHtml: tabTmplt("script 5"),
                            contentHtml: String.html`<span style="margin: 50px">content5</span>` 
                        }, {
                            tabHtml: tabTmplt("script 6"),
                            contentHtml: String.html`<span style="margin: 50px">content6</span>` 
                        }, {
                            tabHtml: tabTmplt("script 7"),
                            contentHtml: String.html`<span style="margin: 50px">content7</span>` 
                        }, {
                            tabHtml: tabTmplt("script 8"),
                            contentHtml: String.html`<span style="margin: 50px">content8</span>` 
                        }, {
                            tabHtml: tabTmplt("script 9"),
                            contentHtml: String.html`<span style="margin: 50px">content9</span>` 
                        }, {
                            tabHtml: tabTmplt("script 10"),
                            contentHtml: String.html`<span style="margin: 50px">content10</span>` 
                        }
                    ]
                });

        tabbed.tabs
            .addClass("editor-tabs")
            .on("mouseleave", () => tabbed.tabs.css("overflow", "hidden").css("overflow-x", "hidden"))
            .on("mouseenter", () => {
                if (tabbed.tabs.overflownX()) {
                    tabbed.tabs.css("overflow-x", "scroll");
                }
            });

        _app.sub("sidebar/changed", () => {
            if (tabbed.active) {
                tabbed.reveal(tabbed.active);
            }
        })
    }
});