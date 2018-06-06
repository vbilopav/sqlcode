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
            let container = tabbed.content;
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
        
        constructor(container) {
            container.data("editor-ref", this);
            container.html(
                String.html`
                    <div class="wrap" style="position: fixed;">
                    </div>
            `);

            this.wrap = container.find(".wrap");
            this.editor = monaco.editor.create(this.wrap, {
                value: "",
                language: 'pgsql',
                theme: "vs-dark",
                renderWhitespace: "all",
                automaticLayout: false
            });
            this.editor.layout({
                height:  container.clientHeight - 10, 
                width:  container.clientWidth - 10
            });
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