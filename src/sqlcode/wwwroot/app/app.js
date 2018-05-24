define([
    "sys/model",
    "sys/pubsub",
    "components/toolbar",
    "components/sidebar",
    "components/workbench"
], (
    Model,
    Pubsub,
    toolbar,
    sidebar,
    workbench,
) => {

    const 
        app = document.body.find(".app").html(
            String.html`
                <div id="toolbar" class="control"></div>
                <div class="container">
                    <div id="sidebar" class="sidebar"></div>
                    <div id="splitter" class="control v-split-2"></div>
                    <div id="workbench" class="workbench"></div>
                </div>
                <div id="footer"></div>`
        ),
        model = new Model().bind(app);

    document.title = "sql code";
    new Pubsub(_app);

    sidebar(
        model.sidebar, model.splitter, Number(model.toolbar.css("width").replace("px", ""))
    );
    workbench(
        model.workbench, Number(model.footer.css("height").replace("px", ""))
    );
    toolbar(model.toolbar);

    /*
    _app
        .subscribe("terminal/toggle", state => console.log("terminal/toggle = " + state))
        .subscribe("results/toggle", state => console.log("results/toggle = " + state));
    */

    return () => {
        document.body.find("#loading-screen-script").remove();
        document.body.find("#loading-screen").remove();
        app.show();
    }
});
