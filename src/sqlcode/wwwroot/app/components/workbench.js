define([
    "sys/model",
    "controls/splitter",
    "components/benches/editor-bench",
    "components/benches/results-bench"
], (
    Model,
    [_, VSplitter],
    editorBench,
    resultsBench
) => {
    return (container, pos) => {

        const model = new Model().bind(container.html(
            String.html`
                <div id="editor" class="editor"></div>
                <div id="splitter" class="control h-split-2"></div>
                <div id="results" class="output"></div>
            `
        ));

        const splitter = new VSplitter({
            name: "workbanch-splitter",
            element: model.splitter,
            container: container,
            dockPosition: pos,
            events: {
                docked: () => _app.pub("results/dock/changed", false, splitter),
                undocked: () => _app.pub("results/dock/changed", true, splitter)
            }

        }).start(maxDelta=50, min=75);

        _app.sub("results/toggle", (state, sender) => {
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
