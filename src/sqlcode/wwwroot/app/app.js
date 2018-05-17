define([
    "text!templates/main.html", 
    "spa/model",
    "ui/splitter",
    "ui/toolbar"
], (
    layout, 
    Model,
    Splitter, 
    Toolbar
) => {

    document.title = "sql code";

    const app = document.body.find("#app-container").html(layout);

    const model = new Model({
        model: {
            toolbar: "toolbar",
            docs: e => e.hasClass("docs-panel"),
            db: e => e.hasClass("db-panel"),
            search: e => e.hasClass("search-panel"),
            lpane: e => e.hasClass("sc-left-pane"),
            splitter: e => e.hasClass("sc-split"),
            rpane: e => e.hasClass("sc-right-pane"),
            footer: "footer",
        }
    }).bind(app);

    const splitter = new Splitter({
        element: model.splitter,
        container: model.splitter.parentElement,
        direction: "h",
        resizeIndex: 0,
        autoIndex: 2,
        dockPosition: Number(model.toolbar.css("width").replace("px", "")),
        /*
        events: {
            docked: () => toolbar.deactivate(),
            undocked: () => toolbar.activate()
        }
        */
    }).run();

    const toolbar = new Toolbar({
        element: model.toolbar, 
        click: {
            docs: state => model.docs.show(state),
            db: state => model.db.show(state),
            search: state => model.search.show(state),
            off: () => {
                splitter.dock();
            },
            terminal: state => console.log("terminal " + (state ? "on": "off")),
            menu: state => console.log("menu " + (state ? "on": "off")),
        }
    });

    return () => {
        document.body.find("#loading-screen-script").remove();
        document.body.find("#loading-screen").remove();
        app.show();
    }
});
