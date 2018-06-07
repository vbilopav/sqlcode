define([
    "vs/editor/editor.main"
], () => {

    var
        tabbed,
        resizeTimeout;

    window.on("resize", () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        } 
        resizeTimeout = setTimeout(() => {
            let container = tabbed.activeContent;
            if (!container) {
                return;
            }
            let instance = container.data("editor-ref");
            instance.editor.layout({
                height:  container.clientHeight - 10, 
                width:  container.clientWidth - 10
            });
        }, 50);
    
    });

    return class {
        
        constructor({
            container=(() => {throw "container is required"})(),
            tab=(() => {throw "tab is required"})(),
            type="pgsql"
        }) {
            container.data("editor-ref", this).html(
                String.html`<div class="wrap" style="position: fixed;"></div>`
            );
            this.tab = tab;
            this.tab.data("type", type);

            this.wrap = container.find(".wrap");
            this.editor = monaco.editor.create(this.wrap, {
                value: "",
                language: type,
                theme: "vs-dark",
                renderWhitespace: "all",
                automaticLayout: false
            });
            this.editor.layout({
                height:  container.clientHeight - 10, 
                width:  container.clientWidth - 10
            });
            this.focus();

            /*
            this.editor.model.onDidChangeContent(e => {
                console.log(e);
            });
            */
        }

        focus() {
            this.editor.focus();
        }

        static init(control) {
            tabbed = control;
            _app
                .sub([
                    "sidebar/docked", 
                    "sidebar/undocked", 
                    "sidebar/changed"
                ], () => window.trigger("resize"))
                .sub([
                    "workbench/docked", 
                    "workbench/undocked", 
                    "workbench/changed", 
                    "state/toggle/results"
                ], () => window.trigger("resize"));
        }
    }

});