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
        updateContentTimeout,
        updateStateTimeout;

    const
        updateContentTimeoutMs = 1000,
        updateStateTimeoutMs = 1000,
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
            }
            this._monaco.model.onDidChangeContent(e => {
                if (e.isFlush) {
                    return;
                }
                dirtyStates.set(this, true);
                if (updateContentTimeout) {
                    clearTimeout(updateContentTimeout);
                } 
                let pending = this;
                updateContentTimeout = setTimeout(() => {
                    pending.save();
                }, updateContentTimeoutMs);
            });
            this._monaco.onContextMenu(() => _app.pub("monaco/context-menu/open"));
            this._monaco.onDidFocusEditor(() => this.container.addClass("editor-focus"));
            this._monaco.onDidBlurEditor(() => this.container.removeClass("editor-focus"));

            this._monaco.onDidChangeCursorPosition(e => {
                if (updateStateTimeout || updateContentTimeout) {
                    clearTimeout(updateStateTimeout);
                } 
                let pending = this;
                updateStateTimeout = setTimeout(() => {
                    pending.saveState();
                }, updateStateTimeoutMs);
            })
        }

        save() {
            if (dirtyStates.get(this) === false || !this._monaco.model) {
                return false;
            }
            clearTimeout(updateContentTimeout);
            updateContentTimeout = undefined;
            service.save(this.id, this.type, {
                viewState: this._monaco.saveViewState(),
                content: this._monaco.model.getValue(),
                title: this.title
            }).then(response => {
                if (response.ok) {
                    dirtyStates.set(this, !response.data.saved);
                } else {
                    dirtyStates.set(this, true);
                    _app.pub("editor/alert/save/fail", { // todo: alerts
                        editor: this,
                        response: response
                    });
                }
            });
            return true;
        }

        saveState() {
            clearTimeout(updateStateTimeout);
            updateStateTimeout = undefined;
            service.updateViewState(this.id, this.type, this._monaco.saveViewState()).then(response => {
                if (!response.ok) {
                    _app.pub("editor/alert/save-state/fail", { // todo: alerts
                        editor: this,
                        response: response
                    });
                }
            });
        }

        saveAll() {
            if (!this.save()) {
                this.saveState();
            }
        }

        restore(id, type, onrestored=()=>{}) {
            service.retreive(id, type).then(response => {
                if (!response.ok || !response.data) {
                    _app.pub("editor/alert/retreive/fail", { // todo: alerts
                        editor: this,
                        response: response
                    });
                    return false;
                }
                clearTimeout(updateContentTimeout);
                updateContentTimeout = undefined;
                this.id = response.data.id;
                this.type = response.data.type;
                this._monaco.setValue(response.data.content == null ? "" : response.data.content);
                this._monaco.restoreViewState(response.data.viewState);
                dirtyStates.set(this, false);
                onrestored()
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