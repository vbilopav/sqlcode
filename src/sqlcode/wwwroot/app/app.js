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
            lpane: e => e.hasClass("sc-left-pane"),
            splitter: e => e.hasClass("sc-split"),
            rpane: e => e.hasClass("sc-right-pane"),
            footer: "footer"
        }
    }).bind(app);

    const splitter = new Splitter({
        element: model.splitter,
        direction: "h",
        resize: 0,
        auto: 2,
        beforeMove: (pr, pos) => {
            if (pr.width - pos <= 250) { // max rpane width
                return false;
            }
            if (pos <= 150) { // max lpane width - 50 (toolbar)
                // now dock
                return false;
            }
            return true;
        }
    });

    const toolbar = new Toolbar({
        element: model.toolbar, 
        splitter: splitter
    });

    return () => {
        document.body.find("#loading-screen-script").remove();
        document.body.find("#loading-screen").remove();
        app.show();
    }
});
