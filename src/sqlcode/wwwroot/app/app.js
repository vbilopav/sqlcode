define([
    "template!layout/main.html",
    "splitter"
], (
    layout,
    Splitter
) => {

    document.title = "sql code";

    const 
        app = document.body.find("#app-container").html(layout()),
        toolbar = app.children[0],

        contianer = app.children[1],
        footer = app.children[2],
        lpane = contianer.children[0],
        splitter = new Splitter({
            element: contianer.children[1],
            direction: "h",
            resize: 0,
            auto: 2
        }),
        rpane = contianer.children[2];

    return () => {
        document.body.find("#loading-screen").remove();
        document.body.find("#loading-screen-script").remove();
        app.show();
    }
});
