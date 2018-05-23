define([
    "sys/model",
    "controls/splitter",
    "components/panes/database-pane",
    "components/panes/docs-pane",
    "components/panes/search-pane",
], (
    Model,
    [HSplitter],
    dbPane,
    docsPane,
    searchPane
) => {
    return (container, split, pos) => {
        
        const model = new Model().bind(
            container.html(
                String.html`
                <div id="docs" class="panel docs-panel"></div>
                <div id="db" class="panel db-panel"></div>
                <div id="search" class="panel search-panel"></div>`
            )
        );

        const splitter = new HSplitter({
            name: "main-splitter",
            element: split,
            container: split.parentElement,
            dockPosition: pos,
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