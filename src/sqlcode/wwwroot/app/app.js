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
    workbench
) => {

    const 
        app = document.body.find(".app").html(
            String.html`
                <div class="container">
                    <div id="toolbar" class="control"></div>
                    <div id="sidebar" class="sidebar"></div>
                    <div id="splitter" class="control"></div>
                    <div id="workbench" class="workbench"></div>
                    <div id="footer"></div>
                </div>
            `),
        model = new Model().bind(app);

    document.title = "sql code";
    new Pubsub(_app);

    sidebar(model.sidebar, model.splitter);
    workbench(model.workbench);
    toolbar(model.toolbar);

    return () => {
        document.body.find("#loading-screen-script").remove();
        document.body.find("#loading-screen").remove();
        app.show();
    }
});
