define(["sys/model",], Model => {

    var model;

    const 
        paneTemplate = String.html`

            <div class="panel-header noselect">
                <div class="panel-title">
                    SCRIPTS
                    <span id="info"></span>
                </div>
                
                <div class="panel-commands">
                    <button id="new" title="Create new script (Ctrl+N)" class="control">new</button>
                    <button id="filter" title="Filter scripts (Ctrl+?)" class="control">filter</button>
                </div>
                
            </div>
            <div id="shadow" class="panel-shadow-line" style="display: none;"></div>
            <div id="content" class="panel-content noselect">
            </div>
            
            `,

        dirEnum = Object.freeze({right: "&#11208;",  down: "&#11206;"}),

        item = (title, dir="right") => String.html`

            <div class="panel-item">
                <span class="expand" data-dir="${dir}">${dirEnum[dir]}</span>
                <span class="text">
                    <span class="icon icon-doc-text"></span>
                    <span class="panel-item-title">${title}</span>
                </span>
            </div>
            
            `.toElement(),

        createItem = (id, title) => {
            let element = item(title).data("id", id).addClass("item-" + id);
            element.find(".text").on("click", () => {
                if (element.hasClass("active")) {
                    return;
                }
                _app.pub("docs/selected", id);
            });
            element.find(".expand").on("click", e => {
                let dir = e.target.data("dir") === "right" ? "down" : "right";
                e.target.data("dir", dir).html(dirEnum[dir]);
            });
            return element;
        },

        updateShadowLine = () => {
            if (model.content.overflownY()) {
                model.shadow.css("display", "");
            } else {
                model.shadow.css("display", "none");
            }
        },

        activate = (item, state) => {
            if (!item.length) {
                return;
            }
            item.toggleClass("active", state);
            if (state) {
                item.scrollIntoView({behavior: "instant", block: "end", inline: "end"});
            }
        }

    return container => {

        model = new Model().bind(container.html(paneTemplate));
        model.new.on("click", e => _app.pub("docs/create", e.target));
        
        _app
            .sub("editor/created", data => {
                model.content.append(createItem(data.id, data.title));
                updateShadowLine();
                model.info = "created...";
                setTimeout(() => model.info = data.count, 1000);
            })
            .sub("editor/activated", data => activate(model.content.find(".item-" + data.id), data.state));

        window
            .on("resize", () => {
                model.content.css("height", (window.innerHeight - 60) + "px");
                updateShadowLine();
            })
            .trigger("resize");
    }

});