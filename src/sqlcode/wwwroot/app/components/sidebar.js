define([
    "sys/model",
    "controls/splitter",
    "components/panes/database-pane",
    "components/panes/docs-pane",
    "components/panes/search-pane",
], (
    Model,
    [VSplitter],
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

        const splitter = new VSplitter({
            name: "main-splitter",
            element: split,
            container: split.parentElement,
            dockPosition: pos,
            events: {
                docked: () => _app.pub("toolbar/deactivate", splitter),
                undocked: () => _app.pub("toolbar/restore", splitter)
            }
        }).start();

        docsPane(model.docs);
        dbPane(model.db);
        searchPane(model.search);

        _app
            .sub("sidebar/toggle", (id, state, sender) => {
                model[id].show(state);
                splitter.undock(220);
            })
            .sub("sidebar/dock", () => splitter.dock(220));
    };
});