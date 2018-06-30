define([], () => {

    const 
        getTemplate = str => {
            let template = document.createElement("template");
            template.innerHTML = str.trim();
            return template;
        }

    return {

        tagToElement: (str, id, content) => {
            let e = typeof str === "object" ? 
                document.createElement(str.toString()) : 
                document.createElement(str);
            if (id) {
                e.id = id;
            }
            if (content) {
                e.html(content);
            }
            return e;
        },
        strToElement: str => getTemplate(str).content.firstChild,
        strToElements: str => getTemplate(str).content.childNodes,
        stripHtml: str => {
            var div = this.tagToElement("div");
            div.innerHTML = str;
            return div.textContent || div.innerText || "";
        }
    }

});