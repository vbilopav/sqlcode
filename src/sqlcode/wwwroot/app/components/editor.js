define([
    "services/script-service",
    "vs/editor/editor.main"
], service => {

    var
        getActiveContentFunc,
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
            let container = getActiveContentFunc();
            if (!container) {
                return;
            }
            let instance = Editor.editorByContainer(container);
            if (!instance) {
                return;
            }
            updateSize(instance._monaco, container);
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
            container=(() => {throw "container is required"})(),
            type=(() => {throw "type is required"})(),
            title=(() => {throw "title is required"})()
        }) {
            this.element = String.html`<div class="wrap" style="position: fixed;"></div>`.toElement();
            container.data(_editorId, this).append(this.element);
            this.id = id;
            this.type = type;
            this.title = title;
            this._monaco = monaco.editor.create(this.element, {
                value: "",
                language: this.type,
                theme: "vs-dark",
                renderWhitespace: "all",
                automaticLayout: false
            });
            updateSize(this._monaco, container);
            this._monaco.model.onDidChangeContent(() => {
                if (updateContentTimeout) {
                    clearTimeout(updateContentTimeout);
                } 
                updateContentTimeout = setTimeout(() => this._save(), 1000);
            });
        }

        _save() {
            service.save(this.id, this.type, {
                viewState: this._monaco.saveViewState(),
                content: this._monaco.model.getValue(),
            });
        }

        restore(id, type) {
            let data = service.retreive(id, type);
            if (!data) {
                return false;
            }
            clearTimeout(updateContentTimeout);
            this._save();
            this.id = id;
            this.type = type;
            this._monaco.setValue(data.content);
            this._monaco.restoreViewState(data.viewState);
        }

        focus() {
            if (!this._monaco.isFocused() && document.contains(this.element)) {
                this._monaco.focus();
            }
        }

        static init(getActiveContent) {
            getActiveContentFunc = getActiveContent;
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