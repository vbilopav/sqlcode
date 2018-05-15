define(["spa/model"], Model => {

    let element,
        //splitter,
        active = "doc";

    const buttons = new Model({
        oncreate: button => {
            button.removeClass("active").on("click", e => {
                if (e.target.data("toggle")) {
                    e.target.toggleClass("active")
                    return;
                }
                active = e.target.id;
                buttons.each(button => button.removeClass("active"))
                e.target.addClass("active");
            })
        }
    });

    return class {
        constructor ({element}) {
            //splitter = e.splitter;
            buttons.bind(element);
            buttons.terminal.data("toggle", true);
            buttons.menu.data("toggle", true);
            buttons[active].addClass("active");
        }
    }
});