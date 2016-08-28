module.exports = (require, args) => {
    var ipcRenderer = require('ipc-renderer');
    console.log(args)
    ipcRenderer.send("testipc", args)

}