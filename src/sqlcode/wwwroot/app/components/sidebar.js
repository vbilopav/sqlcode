define([
    "sys/model",
    "controls/splitter",
    "components/panes/database-pane",
    "components/panes/docs-pane",
    "components/panes/search-pane",
], (
    Model,
    Splitter,
    dbPane,
    docsPane,
    searchPane
) => {
    return (container, splitterElement, dockPosition) => {
        const 
            model = new Model().bind(
                container.html(
                    String.html`
                    <div id="docs" class="panel docs-panel"></div>
                    <div id="db" class="panel db-panel"></div>
                    <div id="search" class="panel search-panel"></div>`
                )
            ),
            splitter = new Splitter({
                name: "main-splitter",
                element: splitterElement,
                container: splitterElement.parentElement,
                direction: "h",
                resizeIndex: 0,
                autoIndex: 2,
                dockPosition: dockPosition,
                events: {
                    docked: () => _app.publish("toolbar/deactivate", splitter),
                    undocked: () => _app.publish("toolbar/restore", splitter)
                }
            }).start();

        docsPane(model.docs);
        dbPane(model.db);
        searchPane(model.search);

        _app
            .subscribe("sidebar/toggle", (id, state, sender) => {
                model[id].show(state);
                splitter.undock(220);
            })
            .subscribe("sidebar/dock", () => splitter.dock(220));
    };
});