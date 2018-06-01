define(["controls/tabbed"], Tabbed => {
    return container => {

        const 
            tabbed = new Tabbed({container, name: "results-tab", height: 20});
            
        tabbed.afterCreate = e => e.tab.addClass("results-tab");
        tabbed.createTabs([
            {tabHtml: "RESULTS", active: true},
            {tabHtml: "MESSAGES"},
            {tabHtml: "LOG"}
        ]);
    }
});