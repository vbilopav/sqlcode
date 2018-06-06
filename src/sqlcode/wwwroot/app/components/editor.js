define([
    "vs/editor/editor.main"
], () => {

    //box-shadow: 0px 0px 2px 1px #000000;

    var 
        tabbed,
        resizeTimeout;

    window.on("resize", () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        } 
        resizeTimeout = setTimeout(() => {
            let container = tabbed.content;
            if (!container) {
                return;
            }
            console.log(container.clientWidth);
            /*
            let container = tabbed.content;
            if (!container) {
                return;
            }
            let instance = container.data("editor-ref"),
                newDeltaWidth = window.innerWidth - container.clientWidth;

            if (newDeltaWidth !== instance._deltaWidth) {
                console.log(container.clientWidth);
                console.log(container.clientWidth - (instance._deltaWidth - newDeltaWidth));

                instance.editor.layout({
                    height: container.clientHeight, 
                    width: container.clientWidth - (instance._deltaWidth - newDeltaWidth)
                })
                
                //instance._deltaWidth = newDeltaWidth;
            }  
            */
            
        }, 250);
    
    });
    

    return class {
        
        constructor(container) {
            this.editor = monaco.editor.create(container, {
                value: "",
                language: 'pgsql',
                theme: "vs-dark",
                renderWhitespace: "all",
                automaticLayout: true
            });
            this._deltaWidth = window.innerWidth - container.clientWidth;
            this._initialWidth = container.clientWidth;
            
            this._intialHeight = container.clientHeight;
            container.data("editor-ref", this);
            
            //this.editor.layout({height: container.clientHeight, width: container.clientWidth})
        }

        static setTabControl(control) {
            tabbed = control;
        }
    }

});