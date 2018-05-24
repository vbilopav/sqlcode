define(["controls/tabbed"], Tabbed => {
    return container => {

        const tabs = 
            new Tabbed({container, name: "editor-tab", tabCreate: e=>e.addClass("editor-tab")})
                //.create("&#128462;script 1")
                //.create("&#128462;script 2");
                
                .create("<span class='icon-doc'></span>script 1")
                .create("<span class='icon-doc'></span>script 2");
    }
});