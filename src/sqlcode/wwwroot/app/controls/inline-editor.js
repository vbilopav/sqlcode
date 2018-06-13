define([], () => {

    let 
        clean = s => s.replace("&nbsp;", "").trim();

    return class {
        constructor ({
            element, 
            getInvalidNamesCallback=()=>[]
        }) {
            let old = clean(element.html()), 
                prev = old,
                content = old,
                isvalid = true,
                invalid = () => {
                    element.addClass("invalid");
                    isvalid = false;
                },
                valid = () => {
                    element.removeClass("invalid");
                    isvalid = true;
                },
                reject = () => {
                    element.html(old).removeClass("invalid").attr("contenteditable", "false");
                },
                accept = () => {
                    if (!isvalid) {
                        element.focus();
                        return;
                    }
                    if (element.attr("contenteditable") === "false") {
                        return;
                    }
                    element.removeClass("invalid").attr("contenteditable", "false").html(content);
                    if (content !== old) {
                        console.log(content);
                    }
                }

            element
            .attr("contenteditable", "true").on("blur", accept)
            .on("focus", () => {
                setTimeout(() => {
                    let sel, range;
                    if (window.getSelection && document.createRange) {
                        range = document.createRange();
                        range.selectNodeContents(element);
                        sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    } else if (document.body.createTextRange) {
                        range = document.body.createTextRange();
                        range.moveToElementText(element);
                        range.select();
                    }
                }, 1);
            })
            .on("keydown", e => {
                if (e.keyCode === 13) {
                    accept();
                    e.preventDefault();
                    return;
                }
            })
            .on("keyup", e => {
                if (e.keyCode === 27) {
                    reject();
                    return;
                }
                content = clean(element.html());
                if (prev === content) {
                    return;
                }
                if (!content.length) {
                    invalid();
                    return;
                }
                let names = getInvalidNamesCallback();
                if (content !== old && names.indexOf(content) !== -1) {
                    invalid();
                    return;
                }
                valid();
                prev = content;
            })
            .focus();
        }

        static editing(element) {
            return element.attr("contenteditable") === "true"
        }
    };
});