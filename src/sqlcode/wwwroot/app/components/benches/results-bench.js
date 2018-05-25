define(["controls/tabbed"], Tabbed => {
    return container => {

        const tabs = 
            new Tabbed({
                container, 
                name: "results-tab", 
                height: 20,
                tabCreated: e => e.addClass("results-tab")
            })
            .create({tabHtml: "RESULTS"})
            .create({tabHtml: "MESSAGES"})
            .create({tabHtml: "HISTORY"});
    }
});