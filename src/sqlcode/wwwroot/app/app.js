define([
    "sys/model",
    "sys/pubsub",
    "sys/storage", 
    "components/toolbar",
    "components/sidebar",
    "components/workbench"
], (
    Model,
    Pubsub,
    Storage,
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
    
    Storage.setStorage(sessionStorage).setNamespace("sqlcode").transferFrom(localStorage);
    window.on("unload",  e => Storage.transferTo(localStorage));

    sidebar(model.sidebar, model.splitter);
    workbench(model.workbench);
    toolbar(model.toolbar);

    return () => setTimeout(() => {
        document.body.find("#loading-screen-script").remove();
        document.body.find("#loading-screen").remove();
        app.show();
    }, 0);
});
