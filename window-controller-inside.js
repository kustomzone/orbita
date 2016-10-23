module.exports = (require, id, script, args) => {
    try {
        var ipcRenderer = require('electron').ipcRenderer;
        var onStart = () => {
            ipcRenderer.send("ORBITA__CONTROL_" + id, "start")
        }
        var onError = (err) => {
            ipcRenderer.send("ORBITA__CONTROL_" + id, "error", err)
        }
        require(script)(args, onStart, onError);
    } catch (e) {
        console.error(e, e.stack);
    }
}