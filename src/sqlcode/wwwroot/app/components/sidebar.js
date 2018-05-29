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
                docked: () => _app.pub("sidebar/docked", splitter),
                undocked: () => _app.pub("sidebar/undocked", splitter),
                changed: () => _app.pub("sidebar/changed", splitter)
            }
        }).start();

        docsPane(model.docs);
        dbPane(model.db);
        searchPane(model.search);

        _app
            .sub("state/toggle", (id, state, sender) => {
                model[id].show(state);
                splitter.undock(220);
            })
            .sub("state/off", () => splitter.dock(220));

        // unnecessray after complete migration to css grid
        window.on("resize", e => {
            if (window.innerWidth < 300 && !splitter.docked) {
                splitter.dock(220);
                _app.pub("sidebar/docked", splitter);
            }
        })
    };
});