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
                <div id="menu" data-toggle="true" class="btn align-center icon-menu"></div>
            </div>`;

    const 
        defaultBtn = "docs",
        cls = "active";

    const
        storage = new Storage({
            namespace: "toolbar",
            model: {
                prev: defaultBtn,
                active: null
            }
        });

    let buttons;

    const
        onButtonClick = e =>  {
            if (e.target.data("toggle")) {
                _app.publish("sidebar/toggle", e.target.id, e.target.hasClass(cls), e.target);
                return;
            }
            buttons.each(button => {
                if (button.hasClass(cls)) {
                    _app.publish("sidebar/toggle", button.id, false, button);
                }
            });
            if (storage.active === e.target.id) {
                storage.prev = storage.active;
                storage.active = null;
                _app.publish("sidebar/dock", e.target);
                return;
            }
            storage.prev = storage.active;
            storage.active = e.target.id;
            _app.publish("sidebar/toggle", e.target.id, true, e.target);
        },
        onButtonCreate = button => {
            button.removeClass(cls).on("click", onButtonClick);
            if (button.data("toggle")) {
                return;
            }
            _app.publish("sidebar/toggle", button.id, button.id === storage.active, button);
        };

    return container => {
        buttons = new Model({oncreate: onButtonCreate}).bind(container.html(template));
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

            });
        if (!storage.active) {
            _app.publish("sidebar/dock", container);
        }
    }
});