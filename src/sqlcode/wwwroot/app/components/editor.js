define([
    "services/script-service",
    "vs/editor/editor.main"
], service => {

    var
        tabbed,
        resizeTimeout,
        updateContentTimeout;
    
    const
        _editorId = "editor-ref";

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
            let instance = Editor.editorByContainer(container);
            if (!instance) {
                return;
            }
            updateSize(instance.monaco, container);
            instance.focus();
        };

    window.on("resize", () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        } 
        resizeTimeout = setTimeout(updateSizeAndFocusOnActiveEditor, 50);
    });

    class Editor {
        constructor({
            id=(() => {throw "id is required"})(),
            title=(() => {throw "title is required"})(),
            container=(() => {throw "container is required"})(),
            tab=(() => {throw "tab is required"})(),
            type=(() => {throw "type is required"})()
        }) {
            container.data(_editorId, this).html(
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

                    service.save(this.id, this.type, {
                        viewState: this.monaco.saveViewState(), 
                        content: this.monaco.model.getValue(), 
                        title: this.title
                    });

                }, 1000);
            });
        }

        restore(id, type) {
            let data = service.retreive(id, type);
            if (!data) {
                return false;
            }
            this.id = id;
            this.type = type;
            this.title = data.title;
            this.monaco.setValue(data.content);
            this.monaco.restoreViewState(data.viewState);
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

        static editorByContainer(container) {
            if (!container) {
                return;
            }
            return container.data(_editorId);
        }
    }

    return Editor;
});