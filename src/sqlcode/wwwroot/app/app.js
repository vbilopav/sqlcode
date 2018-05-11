define(["text!layout.html"], layout => {
    
    document.title = "sql code";

    const 
        app = document.body.find("#app-container").html(layout);
        toolbar = app.children[0];
        main = app.children[1],
        footer = app.children[2],
        left = main.children[0],
        mainSplit = main.children[1],
        right = main.children[2];

    return () => {
        document.body.find("#loading-screen").remove();
        document.body.find("#loading-screen-script").remove();
        app.show();
    }
});
/*
style = window.getComputedStyle(main)
style.gridTemplateColumns
"200px 5px 343px"
main.style.gridTemplateColumns = "400px 5px 343px"
"400px 5px 343px"
main.style.gridTemplateColumns = "400px 5px auto"
"400px 5px auto"
*/
