define([
    "services/script-service",
    "vs/editor/editor.main"
], 
    scriptService => {

    var
        tabbed,
        resizeTimeout,
        updateContentTimeout;

    const 
        updateSize = (monaco, container) => {
            monaco.layout({
                height:  container.clientHeight - 10, 
                width:  container.clientWidth - 10
            });
        },
        updateSizeAndFocusOnActiveEditor = () => {
            let container = tabbed.activeContent;
            if (!container) {
                return;
            }
            let instance = container.data("editor-ref");
            updateSize(instance.monaco, container);
            instance.focus();
        };

    window.on("resize", () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        } 
        resizeTimeout = setTimeout(updateSizeAndFocusOnActiveEditor, 50);
    });

    return class {
        constructor({
            id=(() => {throw "id is required"})(),
            title=(() => {throw "title is required"})(),
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
            this.title = title;
            this.monaco = monaco.editor.create(container.find(".wrap"), {
                value: "",
                language: type,
                theme: "vs-dark",
                renderWhitespace: "all",
                automaticLayout: false
            });
            updateSize(this.monaco, container);
            this.focus();
            
            this.monaco.model.onDidChangeContent(() => {
                if (updateContentTimeout) {
                    clearTimeout(updateContentTimeout);
                } 
                updateContentTimeout = setTimeout(() => {

                    scriptService.saveById(this.id, {
                        viewState: this.monaco.saveViewState(), 
                        content: this.monaco.model.getValue(), 
                        title: this.title
                    });

                }, 1000);
            });
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
                    "state/toggle",
                    "state/off",
                    "workbench/docked",
                    "workbench/undocked",
                    "workbench/changed",
                    "state/toggle/results",
                    "editor/activated"
                ], updateSizeAndFocusOnActiveEditor);
        }
    }

});