define(["spa/model"], Model => {

    let buttons,
        active = "doc";

    return class {
        constructor ({element, events}) {
            buttons = new Model({
                oncreate: button => {
                    button.removeClass("active").on("click", e => {
                        if (e.target.data("toggle")) {
                            e.target.toggleClass("active");
                            events[e.target.id](e.target.hasClass("active"));
                            return;
                        }
                        buttons.each(button => button.removeClass("active"));
                        if (active === e.target.id) {
                            events[active](false);
                            active = null;
                            return;
                        }
                        active = e.target.id;
                        e.target.addClass("active");
                        events[active](true);
                    })
                }
            }).bind(element);

            buttons.terminal.data("toggle", true);
            buttons.menu.data("toggle", true);
            buttons[active].addClass("active");
            
            if (events === undefined) {
                events = {}
            }
            buttons.each((_, name) => {
                if (events[name] === undefined) {
                    events[name] = (()=>{});
                }
            });
        }
    }
});