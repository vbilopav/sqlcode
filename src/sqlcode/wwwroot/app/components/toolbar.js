define(["sys/model", "sys/storage"], (Model, Storage) => {

    const 
        template = String.html`
            <div>
                <div id="docs" class="btn align-center icon-doc-text"></div>
                <div id="db" class="btn align-center icon-database"></div>
                <div id="search" class="btn align-center icon-search"></div>
            </div>
            <div>
                <div id="terminal" data-toggle="true" class="btn align-center icon-terminal"></div>
                <div id="results" data-toggle="true" class="btn align-center icon-menu"></div>
            </div>`;

    const 
        defaultBtn = "docs",
        cls = "active";

    const
        storage = new Storage({
            namespace: "toolbar", 
            model: {
                prev: defaultBtn, 
                active: null,
                results: false
            },
            conversion: {
                // local storage stores only strings
                results: value => value === "true" || value === true
            }
        });
    
    let buttons;

    const
        onToggleBtnClick = btn => {
            let active = btn.toggleClass(cls).hasClass(cls);
            if (btn.id === "results") {
                storage.results = active;
            }
            _app.pub("state/toggle/" + btn.id, btn.id, active, btn);
        },
        onMutexBtnClick = btn =>  {
            buttons.each(button => {
                if (button.hasClass(cls) && !button.data("toggle")) {
                    _app.pub("state/toggle", button.id, false, button);
                }
            });
            if (storage.active === btn.id) {
                storage.prev = storage.active;
                storage.active = null;
                _app.pub("state/off", "toolbar", btn);
                return;
            }
            storage.prev = storage.active;
            storage.active = btn.id;
            _app.pub("state/toggle", btn.id, true, btn);
        },
        onClick = e =>  {
            if (e.target.data("toggle")) {
                onToggleBtnClick(e.target, e);
                return;
            }
            onMutexBtnClick(e.target, e);
        },
        onCreate = btn => {
            btn.removeClass(cls).on("click", onClick);
            if (btn.id === "results") {
                btn.toggleClass(cls, storage.results);
                _app.pub("state/toggle/results", "results", storage.results, btn);
            }
            if (btn.data("toggle")) {
                return;
            }
            _app.pub("state/toggle", btn.id, btn.id === storage.active, btn);
        };

    return container => {
        _app
            .sub("state/toggle", (id, state, sender) => (sender || buttons[id]).toggleClass(cls, state))
            .sub("sidebar/undocked", () => {
                storage.active = storage.prev;
                if (!storage.active) {
                    storage.active = defaultBtn;
                }
                let id = storage.active;
                _app.pub("state/toggle", id, true, buttons[id]);
            })
            .sub("sidebar/docked", () => {
                if (!storage.active) {
                    return;
                }
                storage.prev = storage.active;
                storage.active = null;
                if (!storage.prev) {
                    return;
                }
                let id = storage.prev;
                _app.pub("state/toggle", id, false, buttons[id]);
            })
            .sub("workbench/dock", state => {
                storage.results = state;
                buttons.results.toggleClass(cls, state);
            });

        buttons = new Model({oncreate: onCreate}).bind(container.html(template));
        if (!storage.active) {
            _app.pub("state/off", "toolbar", container);
        }
    }
});