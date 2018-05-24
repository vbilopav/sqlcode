define(["sys/model", "sys/storage"], (Model, Storage) => {

    const 
        template = String.html`
            <div>
                <div id="docs" class="btn align-center icon-doc"></div>
                <div id="db" class="btn align-center icon-database"></div>
                <div id="search" class="btn align-center icon-search"></div>
            </div>
            <div class="bottom-btns">
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
            _app.publish(`${btn.id}/toggle`, active, btn);
        },
        onMutexBtnClick = btn =>  {
            buttons.each(button => {
                if (button.hasClass(cls)) {
                    _app.publish("sidebar/toggle", button.id, false, button);
                }
            });
            if (storage.active === btn.id) {
                storage.prev = storage.active;
                storage.active = null;
                _app.publish("sidebar/dock", btn);
                return;
            }
            storage.prev = storage.active;
            storage.active = btn.id;
            _app.publish("sidebar/toggle", btn.id, true, btn);
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
                _app.publish("results/toggle", storage.results, btn);
            }
            if (btn.data("toggle")) {
                return;
            }
            _app.publish("sidebar/toggle", btn.id, btn.id === storage.active, btn);
        };

    return container => {
        _app
            .subscribe("sidebar/toggle", (id, state, sender) => (sender || buttons[id]).toggleClass(cls, state))
            .subscribe("toolbar/restore", () => {
                storage.active = storage.prev;
                if (!storage.active) {
                    storage.active = defaultBtn;
                }
                let id = storage.active;
                _app.publish("sidebar/toggle", id, true, buttons[id]);
            })
            .subscribe("toolbar/deactivate", () => {
                if (!storage.active) {
                    return;
                }
                storage.prev = storage.active;
                storage.active = null;
                if (!storage.prev) {
                    return;
                }
                let id = storage.prev;
                _app.publish("sidebar/toggle", id, false, buttons[id]);
            })
            .subscribe("results/dock/changed", state => {
                storage.results = state;
                buttons.results.toggleClass(cls, state);
            });

        buttons = new Model({oncreate: onCreate}).bind(container.html(template));
        if (!storage.active) {
            _app.publish("sidebar/dock", container);
        }
    }
});