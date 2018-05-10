define(["text!layout.html"], layout => {

    let initApp = () => {
        document.body.find("#loading-screen").remove();
        document.body.find("#loading-screen-script").remove();
        return app = document.body.find("#app-container");
    }

    return () => {
        document.title = "sql code";
        initApp().html(layout).show();
    }
});
