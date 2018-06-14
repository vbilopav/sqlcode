define([], () => {

    let 
        clean = s => s.replace("&nbsp;", "").replace("\\n", "").trim();

    return class {
        constructor ({
            element, 
            getInvalidNamesCallback=()=>[],
            acceptArgs,
            onaccept=(()=>{})
        }) {
            let old = clean(element.html()), 
                oldTitle = element.attr("title"),
                prev = old,
                content = old,
                isvalid = true,
                invalid = () => {
                    element.addClass("invalid").attr("title", "This is not valid value. Press ESC to exit editing and to revert to original.");
                    isvalid = false;
                },
                valid = () => {
                    element.removeClass("invalid").attr("title", oldTitle);
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
                        onaccept(content, acceptArgs)
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
                    valid();
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