define([
    "sys/model",
    "controls/splitter"
], (
    Model,
    [_, VSplitter]
) => {
    return (container, pos) => {

        const model = new Model().bind(container.html(
            String.html`
                <div id="editor" class="editor">editor</div>
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
                docked: () => _app.publish("results/docked", splitter),
                undocked: () => _app.publish("results/undocked", splitter)
            }

        }).start(maxDelta=50, min=75);

        _app.subscribe("results/toggle", (state, sender) => {
            if (state) {
                splitter.undock(220);
            } else {
                splitter.dock(220);
            }
        });
    }
    
});
