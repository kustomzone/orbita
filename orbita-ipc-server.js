var electron = require('electron');
var ipcMain = electron.ipcMain;

var tr = (opts) => {
    var callbacks = {

    }
    ipcMain.on(opts.address, (event, name, data) => {
        if (callbacks[name]) {
            callbacks[name](data);
        }
    });
    return {
        in: (name, callback) => {
            callbacks[name] = callback;
        },
        out: (name) => {
            return function (data) {
                tr.orbita.send(opts.address, name, data);
            }
        }
    }
}
tr.orbita = null;
module.exports = tr