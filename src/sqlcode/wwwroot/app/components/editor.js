define([
    "vs/editor/editor.main"
], () => {

    var
        tabbed,
        resizeTimeout;

    const 
        updateSizeOfActiveEditor = () => {
            let container = tabbed.activeContent;
                if (!container) {
                    return;
                }
                let instance = container.data("editor-ref");
                instance.monaco.layout({
                    height:  container.clientHeight - 10, 
                    width:  container.clientWidth - 10
                });
        }

    window.on("resize", () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        } 
        resizeTimeout = setTimeout(updateSizeOfActiveEditor, 50);
    });

    return class {
        
        constructor({
            id=(() => {throw "id is required"})(),
            container=(() => {throw "container is required"})(),
            tab=(() => {throw "tab is required"})(),
            type=(() => {throw "type is required"})()
        }) {
            container.data("editor-ref", this).html(
                String.html`<div class="wrap" style="position: fixed;"></div>`
            );
            this.id = id;
            this.tab = tab;
            this.type = type;
            this.monaco = monaco.editor.create(container.find(".wrap"), {
                value: "",
                language: type,
                theme: "vs-dark",
                renderWhitespace: "all",
                automaticLayout: false
            });
            this.monaco.layout({
                height:  container.clientHeight - 10, 
                width:  container.clientWidth - 10
            });
            this.focus();
            /*
            this.monaco.model.onDidChangeContent(e => {
                console.log(e);
            });
            */
        }

        focus() {
            this.monaco.focus();
        }

        static init(control) {
            tabbed = control;
            _app
                .sub([
                    "sidebar/docked",
                    "sidebar/undocked",
                    "sidebar/changed",
                    "workbench/docked",
                    "workbench/undocked",
                    "workbench/changed",
                    "state/toggle/results",
                    "editor/activated"
                ], updateSizeOfActiveEditor);
        }
    }

});