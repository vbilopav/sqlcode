define([], () => {

    return container => {
        container.html(
            String.html`
                <div class="editor">editor</div>
                <div class="control h-split-2"></div>
                <div class="output"></div>
            `
        );
    }
    
});
