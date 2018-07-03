define(["sys/html"], html => {

    const
        clean = s => s.replace(/&nbsp;/g, "").replace(/\\n/g, "").trim();

    return class {
        constructor ({
            element, 
            values=[],
            acceptArgs,
            onaccept=(()=>{}),
            max=100
        }) {
            this.element = element;
            const
                old = clean(element.html()),
                oldTitle = element.attr("title");
            let
                prev = old,
                content = old;
            
            this.isvalid = true;
            const
                invalid = () => this.setInvalid(),
                valid = () => {
                    element.removeClass("invalid").attr("title", oldTitle);
                    this.isvalid = true;
                },
                reject = () => element.html(old).removeClass("invalid").attr("contenteditable", "false"),
                accept = () => {
                    if (!this.isvalid) {
                        element.focus();
                        return;
                    }
                    if (element.attr("contenteditable") === "false") {
                        return;
                    }
                    element.removeClass("invalid").attr("contenteditable", "false").html(content);
                    if (content !== old) {
                        this.element.attr("title", content);
                        onaccept(html.stripHtml(content), acceptArgs)
                    }
                },
                validate = () => {
                    content = clean(element.html());
                    if (prev === content) {
                        valid();
                        return;
                    }
                    if (!content.length) {
                        invalid();
                        return;
                    }
                    if (content !== old && values.indexOf(content) !== -1) {
                        invalid();
                        return;
                    }
                    valid();
                    prev = content;
                }
                        
            this.editable()
                .on("blur", accept)
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
                        validate();
                        if (valid) {
                            accept();
                        }
                        e.preventDefault();
                        return;
                    }
                    if (content.length >= max) {
                        if (
                            (e.keyCode > 47 && e.keyCode < 58) ||
                            e.keyCode === 32 || e.keyCode === 13 ||
                            (e.keyCode > 64 && e.keyCode < 91) ||
                            (e.keyCode > 95 && e.keyCode < 112) ||
                            (e.keyCode > 185 && e.keyCode < 193) ||
                            (e.keyCode > 218 && e.keyCode < 223)
                            ) {
                                e.preventDefault();
                        }
                    }
                })
                .on("keyup", e => {
                    if (e.keyCode === 27) {
                        reject();
                        return;
                    }
                    validate();
                })
                .on("paste", e => {
                    let pasted = clean((e.clipboardData || window.clipboardData).getData("text"));
                    if (pasted.length >= max) {
                        pasted = pasted.substring(0, max);
                    }
                    element.html(pasted);
                    e.preventDefault();
                })
                .focus();
        }

        editable () {
            return this.element.attr("contenteditable", "true");
        }

        setInvalid () {
            this.element.addClass("invalid").attr("title", "This is not valid value! Enter valid text or press ESC to exit editing and to revert to original value.");
            this.isvalid = false;
        }

        static editing(element) {
            return element.attr("contenteditable") === "true";
        }
    };
});