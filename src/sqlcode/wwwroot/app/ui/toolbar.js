define(["sys/model", "sys/storage"], (Model, Storage) => {

    const 
        defaultBtn = "docs",
        storage = new Storage({
            namespace: "toolbar",
            model: {
                prev: null,
                active: null
            }
        }),
        cls = "active";

    let 
        handlers,
        buttons

    return {
        init: ({element, events}) => {
            handlers = events;
            buttons = new Model({
                oncreate: button => {
                    button.removeClass(cls).on("click", e => {
                        if (e.target.data("toggle")) {
                            e.target.toggleClass(cls);
                            handlers[e.target.id](e.target.hasClass(cls));
                            return;
                        }
                        buttons.each(button => {
                            if (button.hasClass(cls)) {
                                handlers[button.id](false);
                            }
                            button.removeClass(cls);
                        });
                        if (storage.active === e.target.id) {
                            storage.prev = storage.active;
                            storage.active = null;
                            handlers["off"]();
                            return;
                        }
                        storage.prev = storage.active;
                        storage.active = e.target.id;
                        e.target.addClass(cls);
                        handlers[storage.active](true);
                    })
                }
            }).bind(element);

            buttons.terminal.data("toggle", true);
            buttons.menu.data("toggle", true);
            
            buttons.each(button => {
                if (button.data("toggle")) {
                    return;
                }
                if (button.id === storage.active) {
                    button.addClass(cls);
                    handlers[button.id](true);
                } else {
                    button.removeClass(cls);
                    handlers[button.id](false);
                }
            });
            if (!storage.active) {
                handlers["off"]();
            }
        },

        deactivate: () => {
            if (!storage.active) {
                return;
            }
            storage.prev = storage.active;
            storage.active = null;
            if (!storage.prev) {
                return;
            }
            buttons[storage.prev].removeClass(cls);
            handlers[storage.prev](false);
        },

        restore: () => {
            storage.active = storage.prev;
            if (!storage.active) {
                storage.active = defaultBtn;
            }
            buttons[storage.active].addClass(cls);
            handlers[storage.active](true);
        }
    }
});