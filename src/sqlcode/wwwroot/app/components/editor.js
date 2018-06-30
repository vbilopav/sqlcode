define([
    "sys/html",
    "services/script-service",
    "vs/editor/editor.main"
], (
    html, 
    service
) => {

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
            const container = getActiveContentFunc();
            if (!container) {
                return {container: undefined, editor: undefined};
            }
            const editor = Editor.editorByContainer(container);
            if (!editor) {
                return {container: container, editor: undefined};
            }
            return {container: container, editor: editor};
        },
        updateSizeAndFocusOnActiveEditor = () => {
            const {container, editor} = getActiveEditor();
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

    const 
        dirtyStates = {
            _states: {},
            set: (instance, state) => dirtyStates._states[instance.id + "-" + instance.type] = state,
            get: instance => dirtyStates._states[instance.id + "-" + instance.type]
        };

    class Editor {
        constructor({
            id=(() => {throw "id is required"})(),
            container=(() => {throw "container is required"})(),
            type=(() => {throw "type is required"})(),
            title=(() => {throw "title is required"})(),
            existing
        }) {
            this.element = html.strToElement(
                String.html`<div class="wrap" style="position: fixed;"></div>`
            );
            this.container = container.data(_editorId, this).append(this.element);
            this.id = id;
            this.type = type;
            this.title = title;
            this._monaco = monaco.editor.create(this.element, {
                value: "",
                language: this.type,
                theme: "vs-dark", // todo options
                renderWhitespace: "all", // todo options
                automaticLayout: false
            });
            updateSize(this._monaco, container);
            if (!existing) {
                dirtyStates.set(this, true);
                this.save();
                //dirtyStates.set(this, false);
            }
            this._monaco.model.onDidChangeContent(() => {
                dirtyStates.set(this, true);
                if (updateContentTimeout) {
                    clearTimeout(updateContentTimeout);
                } 
                updateContentTimeout = setTimeout(() => {
                    this.save();
                    //dirtyStates.set(this, false);
                }, 1000);
            });
            this._monaco.onContextMenu(() => _app.pub("monaco/context-menu/open"));
            this._monaco.onDidFocusEditor(() => this.container.addClass("editor-focus"));
            this._monaco.onDidBlurEditor(() => this.container.removeClass("editor-focus"));
        }

        save() {
            if (dirtyStates.get(this) === false || !this._monaco.model) {
                return;
            }
            service.save(this.id, this.type, {
                viewState: this._monaco.saveViewState(),
                content: this._monaco.model.getValue(),
                title: this.title
            }).then(response => {
                if (response.ok) {
                    dirtyStates.set(this, !response.data.Saved);
                } else {
                    dirtyStates.set(this, true);
                    _app.pub("editor/alert/save/fail", {
                        editor: this,
                        response: response
                    });
                }
            });
        }

        restore(id, type) {
            service.retreive(id, type).then(response => {
                if (!response.ok || !response.data) {
                    _app.pub("editor/alert/retreive/fail", {
                        editor: this,
                        response: response
                    });
                    return false;
                }
                clearTimeout(updateContentTimeout);
                this.id = response.data.id;
                this.type = response.data.type;
                this._monaco.setValue(response.data.content);
                this._monaco.restoreViewState(response.data.viewState);
                dirtyStates.set(this, false);
            });
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
                    const {container, editor} = getActiveEditor();
                    if (!editor) {
                        return;
                    }
                    editor.focus();
                })
                .sub([
                    "scripts/title/update", 
                    "editor/title/update"
                ], (title, id, type) => service.updateTitle(id, type, title));
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