define([
    "sys/model",
    "controls/splitter"
], (
    Model,
    Splitter
) => {
    return container => {
        const model = new Model().bind(container.html(
            String.html`
                <div id="editor" class="editor">editor</div>
                <div id="splitter" class="control h-split-2"></div>
                <div id="output" class="output"></div>
            `
        ));

        const splitter = new Splitter({
            //name: "workbanch-splitter",
            element: model.splitter,
            container: container,
            direction: "v",
            resizeIndex: 2,
            autoIndex: 0,
            dockPosition: 50,
            /*
            events: {
                docked: () => _app.publish("toolbar/deactivate", splitter),
                undocked: () => _app.publish("toolbar/restore", splitter)
            }
            */
        }).start();
    }
    
});
