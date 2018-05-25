define(["controls/tabbed"], Tabbed => {
    return container => {

        const tabs = 
            new Tabbed({
                container, 
                name: "results-tab", 
                height: 20,
                tabCreate: e=>e.addClass("results-tab")
            })
            .create({tabHtml: "RESULTS"})
            .create({tabHtml: "MESSAGES"});
    }
});