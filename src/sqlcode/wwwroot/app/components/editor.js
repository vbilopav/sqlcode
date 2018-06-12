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
        getActiveEditor = () => {
            let container = getActiveContentFunc();
            if (!container) {
                return {container: undefined, editor: undefined};
            }
            let editor = Editor.editorByContainer(container);
            if (!editor) {
                return {container: container, editor: undefined};
            }
            return {container: container, editor: editor};
        }
        updateSizeAndFocusOnActiveEditor = () => {
            let {container, editor} = getActiveEditor();
            if (!editor || !container) {
                return;
            }
            updateSize(editor._monaco, container);
            //editor.focus();
        };

    window.on("resize", () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        } 
        resizeTimeout = setTimeout(updateSizeAndFocusOnActiveEditor, 50);
    });

    const dirtyStates = {
        _states: {},
        setState: (instance, state) => {
            dirtyStates._states[instance.id + "-" + instance.type] = state;
        },
        getState: instance => dirtyStates._states[instance.id + "-" + instance.type]
    };

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
                dirtyStates.setState(this, true);
                if (updateContentTimeout) {
                    clearTimeout(updateContentTimeout);
                } 
                updateContentTimeout = setTimeout(() => {
                    this.save();
                    dirtyStates.setState(this, false);
                }, 1000);
            });
            this._monaco.onContextMenu(() => _app.pub("monaco/context-menu/open"));
        }

        save() {
            if (dirtyStates.getState(this) === false) {
                return;
            }
            service.save(this.id, this.type, {
                viewState: this._monaco.saveViewState(),
                content: this._monaco.model.getValue(),
                title: this.title
            });
        }

        restore(id, type) {
            let data = service.retreive(id, type);
            if (!data) {
                return false;
            }
            clearTimeout(updateContentTimeout);
            this.save();
            this.id = id;
            this.type = type;
            this._monaco.setValue(data.content);
            dirtyStates.setState(this, false);
            this._monaco.restoreViewState(data.viewState);
        }

        focus() {
            if (!this._monaco.isFocused() && document.contains(this.element)) {
                this._monaco.focus();
            }
        }

        dispose() {
            this._monaco.dispose();
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
                ], updateSizeAndFocusOnActiveEditor)
                .sub("monaco/active-editor/focus", () => {
                    let {container, editor} = getActiveEditor();
                    if (!editor) {
                        return;
                    }
                    editor.focus();
                });
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