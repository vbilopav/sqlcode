define([
    "text!templates/main.html", 
    "ui/splitter",
    "ui/toolbar"
], (
    layout, 
    Splitter, 
    Toolbar
) => {

    document.title = "sql code";

    const 
        app = document.body.find("#app-container").html(layout),
        container = app.children[1],
        footer = app.children[2],
        lpane = container.children[0],
        splitter = new Splitter({
            element: container.children[1],
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
        }),
        rpane = container.children[2],
        toolbar = new Toolbar({element: app.children[0], splitter: splitter});

    return () => {
        document.body.find("#loading-screen").remove();
        document.body.find("#loading-screen-script").remove();
        app.show();
    }
});
