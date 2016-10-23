window.$$$require$$$ = require;
window.$$$_realStringStartWith = String.prototype.startsWith;
var oldStartWith;
var ipcRenderer = require('electron').ipcRenderer;
var controller = require('./window-controller-inside');
ipcRenderer.on("load-control-script", (e, modulePath, id, script, args) => {
    oldStartWith = String.prototype.startsWith;
    String.prototype.startsWith = window.$$$_realStringStartWith;
    controller(window.$$$require$$$, id, JSON.parse(script), args);
    String.prototype.startsWith = oldStartWith;
})