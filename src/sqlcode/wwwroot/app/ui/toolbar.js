define(["spa/model"], Model => {

    const 
        cls = "active",
        defaultBtn = "docs";

    let 
        prev = null,
        active,
        handlers,
        buttons

    return {
        init: ({element, events}) => {
            
            prev = null;
            active = defaultBtn;
            
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
                        if (active === e.target.id) {
                            prev = active;
                            active = null;
                            handlers["off"]();
                            return;
                        }
                        prev = active;
                        active = e.target.id;
                        e.target.addClass(cls);
                        handlers[active](true);
                    })
                }
            }).bind(element);

            buttons.terminal.data("toggle", true);
            buttons.menu.data("toggle", true);
            buttons[active].addClass(cls);
            
            if (handlers === undefined) {
                handlers = {}
            }
            buttons.each((_, name) => {
                if (handlers[name] === undefined) {
                    handlers[name] = ()=>{};
                }
            });
        },

        deactivate: () => {
            if (!active) {
                return;
            }
            prev = active;
            active = null;
            buttons[prev].removeClass(cls);
            handlers[prev](false);
        },

        restore: () => {
            active = prev;
            if (!active) {
                active = defaultBtn;
            }
            buttons[active].addClass(cls);
            handlers[active](true);
        }
    }
});