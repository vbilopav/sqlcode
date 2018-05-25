define(["controls/tabbed"], Tabbed => {
    
    const 
        tabTlt = title => String.html`
            <span class="icon icon-doc"></span>
            ${title}
            <span class="close" title="Close (Ctrl+F4)">&#10006;</span>
        `;
    
    return container => {

        const tabs = 
            new Tabbed({
                container, 
                name: "editor-tab", 
                tabCreate: e => e.addClass("editor-tab"),
                tabs: [
                    {
                        tabHtml: tabTlt("script 1"),
                        contentHtml: String.html`<span style:"margin: 50">content1</span>` 
                    },
                    {
                        tabHtml: tabTlt("script 2"),
                        contentHtml: String.html`<span style:"margin: 50">content2</span>` 
                    },
                    {
                        tabHtml: tabTlt("script 3"),
                        contentHtml: String.html`<span style:"margin: 50">content3</span>` 
                    },
                    {
                        tabHtml: tabTlt("script 4"),
                        contentHtml: String.html`<span style:"margin: 50">content4</span>` 
                    }
                ]
            })
        tabs.model.tabs.addClass("editor-tabs")
    }
});