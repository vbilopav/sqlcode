define([], () => {

    let element,
        splitter,
        active = "docs";

    const buttons = {};

    const eachButton = callback => {
        for(let [id, button] of Object.entries(buttons)) {
            callback(id, button);
        }
    };
    const setActive = () => {
        eachButton((id, button) => button.removeClass("active"));
        buttons[active].addClass("active")
    };
    const initBtns = () => {
        buttons.docs = element.children[0].children[0];
        buttons.db = element.children[0].children[1];
        buttons.search = element.children[0].children[2];
        buttons.terminal = element.children[1].children[0].data("toggle", true);
        buttons.menu = element.children[1].children[1].data("toggle", true);
    };

    return class {
        constructor (e) {
            element = e.element;
            splitter = e.splitter;
            initBtns();
            eachButton((id, button) => button.removeClass("active").attr("id", id).on("click", e => {
                if (e.target.data("toggle")) {
                    e.target.toggleClass("active")
                    return;
                }
                active = e.target.id;
                setActive();
            }));
            buttons[active].addClass("active");
        }
    }
});