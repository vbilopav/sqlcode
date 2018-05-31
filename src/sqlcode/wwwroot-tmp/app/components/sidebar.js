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
    return (container, split) => {

        const 
            model = new Model().bind(
                container.html(
                    String.html`
                    <div id="docs" class="panel panel-h docs-panel"></div>
                    <div id="db" class="panel panel-h db-panel"></div>
                    <div id="search" class="panel panel-h search-panel"></div>`
                )
            ),
            splitter = new VSplitter({
                name: "main-splitter",
                element: split,
                container: split.parentElement,
                resizeIdx: 1,
                autoIdx: 3,
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
                if (state) {
                    splitter.undock(220, true);
                }
            })
            .sub("state/off", () => splitter.dock(220));

        let last = window.innerWidth;
        window.on("resize", () => {
            if (splitter.docked) {
                return;
            }
            let v = splitter.getValues(),
                w = window.innerWidth,
                delta = w - last;
                last = w;
            if (w - v.prev < 100) {
                splitter.move(delta, v);
            }
        });
    };
});