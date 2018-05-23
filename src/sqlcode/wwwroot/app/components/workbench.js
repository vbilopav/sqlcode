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
                <div id="output" class="output"></div>
            `
        ));


        const splitter = new VSplitter({
            name: "workbanch-splitter",
            element: model.splitter,
            container: container,
            dockPosition: pos,
            //events: {
            //    docked: () => _app.publish("toolbar/deactivate", splitter),
            //    undocked: () => _app.publish("toolbar/restore", splitter)
            //}

        }).start(maxDelta=50, min=75);

    }
    
});
