define(["controls/tabbed"], Tabbed => {
    
    const 
        tabTmplt = title => String.html`
            <span class="icon icon-doc"></span>
            <span class="close" title="Close (Ctrl+F4)">&#10006;</span>
            ${title}
        `;
    
    return container => {

        const 
            tabCreated = tab => {
                tab.addClass("editor-tab").find(".close")
                    .on("mousedown", e => {
                        e.target.css("font-weight", "900").data("up", true)
                    })
                    .on("mouseup", e => {
                        if (!e.target.data("up")) {
                            return;
                        }
                        e.target.data("canceled", true);
                        e.target.css("font-weight", "");
                        tabbed.closeByTab(tab);
                    })
                    .on("click", () => console.log("clicked"))
            },
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
                        }
                    ]
                });
        tabbed.tabs.addClass("editor-tabs");
    }
});