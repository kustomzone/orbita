window.$$$require$$$ = require;
window.$$$_realStringStartWith = String.prototype.startsWith;
var oldStartWith;
var ipcRenderer = require('electron').ipcRenderer;
//var controller = require('./window-controller-inside');
//, id, script, args
ipcRenderer.on("load-script", function (e, modulePath) {
    try {
        //fucking
        oldStartWith = String.prototype.startsWith;
        String.prototype.startsWith = window.$$$_realStringStartWith;
        //        
        var args = [window.$$$require$$$];
        for (var i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        console.log(args);
        require(modulePath).apply(this, args);// (window.$$$require$$$, id, JSON.parse(script), args);
        //fucking
        String.prototype.startsWith = oldStartWith;
        //
    } catch (e) {
        console.error(e, e.stack);
    }
})