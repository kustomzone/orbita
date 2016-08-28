module.exports = (require, id, script, args) => {
    var ipcRenderer = require('ipc-renderer');
    Promise.resolve(require(script)(args)).then(() => {
        ipcRenderer.send("ORBITA__START_" + id, { status: "success" })
    }).catch((err) => {
        ipcRenderer.send("ORBITA__START_" + id, { status: "error", error: err })
    })
}