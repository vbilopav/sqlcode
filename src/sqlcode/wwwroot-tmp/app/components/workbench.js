define([
    "sys/model",
    "controls/splitter",
    "components/benches/editor-bench",
    "components/benches/results-bench"
], (
    Model,
    [_, HSplitter],
    editorBench,
    resultsBench
) => {
    return (container, pos) => {

        const 
            model = new Model().bind(container.html(
                String.html`
                    <div id="editor" class="editor"></div>
                    <div id="splitter" class="control h-split-2"></div>
                    <div id="results" class="output"></div>`
            )),
            splitter = new HSplitter({
                name: "workbanch-splitter",
                element: model.splitter,
                container: container,
                dockPosition: pos,
                resizeIdx: 2,
                autoIdx: 0,
                dockPosition: 20,
                maxDelta: 100,
                min=75,
                events: {
                    docked: () => _app.pub(["workbench/docked", "workbench/dock"], false, splitter),
                    undocked: () => _app.pub(["workbench/undocked", "workbench/dock"], true, splitter),
                }
            }).start();

        _app.sub("state/toggle/results", (id, state, sender) => {
            if (state) {
                splitter.undock(220);
            } else {
                splitter.dock(220);
            }
        });

        editorBench(model.editor);
        resultsBench(model.results);
    }

});
