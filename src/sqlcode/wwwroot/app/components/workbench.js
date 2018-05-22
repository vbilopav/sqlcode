define([], () => {

    return container => {
        container.html(
            String.html`
                <div id="editor" class="editor">editor</div>
                <div id="splitter" class="control h-split-2"></div>
                <div id="output" class="output"></div>
            `
        );
    }
    
});
