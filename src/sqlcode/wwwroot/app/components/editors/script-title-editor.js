define([
    "services/script-service",
    "controls/inline-editor"
], 
(
    service, 
    InlineEditor
) => class {

    constructor({
        element, 
        id, 
        type, 
        onaccept
    }) {
        service.getNames(type).then(response => {

            const inline = new InlineEditor({
                element: element,
                values: response.data || [],
                onaccept: newContent => {
                    service.updateTitle(id, type, newContent).then(response => {
                        if (!response.ok) {
                            inline.editable();
                            inline.element.focus();
                            inline.setInvalid();
                            _app.pub("scripts/title/save/fail", {id: id, type: type, title: newContent}); // todo: alerts
                            return;
                        }
                        !onaccept || onaccept({element, id, type, newContent});
                    });
                }
            });

        });
    }

    static editing(element) {
        return InlineEditor.editing(element);
    }

});