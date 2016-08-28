module.exports = (require, id, script, args) => {
    var ipcRenderer = require('electron').ipcRenderer;
    var onStart = () => {
        ipcRenderer.send("ORBITA__CONTROL_" + id, "start")
    }
    var onError = (err) => {
        ipcRenderer.send("ORBITA__CONTROL_" + id, "error", err)
    }
    require(script)(args, onStart, onError);
}