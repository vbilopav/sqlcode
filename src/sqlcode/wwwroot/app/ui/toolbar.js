define([], () => {

    let element,
        buttons = {},
        active = "docs",
        eachButton = callback => {
            for(let [id, button] of Object.entries(buttons)) {
                callback(id, button);
            }
        },
        setActive = () => {
            eachButton((id, button) => button.removeClass("active"));
            buttons[active].addClass("active")
        }

    return class {
        constructor (element_) {
            element = element_;
            this._initBtns();
            eachButton((id, button) => button.removeClass("active").attr("id", id).on("click", e => {
                active = e.target.id;
                setActive();
            }));
            buttons[active].addClass("active");
        }

        _initBtns () {
            buttons.docs = element.children[0].children[0]; 
            buttons.db = element.children[0].children[1];
            buttons.search = element.children[0].children[2];
            buttons.terminal = element.children[1].children[0];
            buttons.menu = element.children[1].children[1];
        }
    }
});