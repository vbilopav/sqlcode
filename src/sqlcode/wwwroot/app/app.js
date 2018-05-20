define([
    "text!templates/main.html", 
    "sys/model",
    "ui/splitter",
    "ui/toolbar",
    "ui/database-pane",
    "ui/docs-pane",
    "ui/search-pane"
], (
    layout, 
    Model,
    Splitter, 
    toolbar,
    dbPane,
    docsPane,
    searchPane
) => {

    document.title = "sql code";

    const app = document.body.find("#app-container").html(layout);

    const appModel = new Model({
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
        name: "main-splitter",
        element: appModel.splitter,
        container: appModel.splitter.parentElement,
        direction: "h",
        resizeIndex: 0,
        autoIndex: 2,
        dockPosition: Number(appModel.toolbar.css("width").replace("px", "")),
        events: {
            docked: () => toolbar.deactivate(),
            undocked: () => toolbar.restore()
        }
    }).run();

    toolbar.init({
        element: appModel.toolbar, 
        events: {
            docs: state => {
                appModel.docs.show(state);
                splitter.undock(220);
            },
            db: state => {
                appModel.db.show(state);
                splitter.undock(220);
            },
            search: state => {
                appModel.search.show(state);
                splitter.undock(220);
            },
            off: () => {
                splitter.dock(220);
            },
            terminal: state => console.log("terminal " + (state ? "on": "off")),
            menu: state => console.log("menu " + (state ? "on": "off")),
        }
    });

    docsPane.init({
        container: appModel.docs
    });

    dbPane.init({
        container: appModel.db
    });

    searchPane.init({
        container: appModel.search
    });

    return () => {
        document.body.find("#loading-screen-script").remove();
        document.body.find("#loading-screen").remove();
        app.show();
    }
});
