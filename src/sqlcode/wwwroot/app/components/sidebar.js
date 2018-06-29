define([
    "sys/model",
    "controls/splitter",
    "components/panes/database-pane",
    "components/panes/scripts-pane",
    "components/panes/search-pane",
], (
    Model,
    [VSplitter],
    dbPane,
    scriptsPane,
    searchPane
) => {
    return (container, split) => {

        const 
            model = new Model().bind(
                container.html(
                    String.html`
                    <div id="scripts" class="panel panel-h scripts-panel"></div>
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

        scriptsPane(model.scripts);
        dbPane(model.db);
        searchPane(model.search);

        _app
            .sub("state/toggle", (id, state, sender) => {
                model[id].show(state);
                if (state) {
                    splitter.undock(true);
                }
            })
            .sub("state/off", () => splitter.dock(true));

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

        container.find(".panel-content")
            .on("mouseleave", e => {
                e.target.css("overflow-y", "hidden");
                split.css("z-index", "");
            })
            .on("mouseenter", e => {
                if (e.target.overflownY()) {
                    e.target.css("overflow-y", "scroll");
                    split.css("z-index", "1");
                }
            });
            
    };
});