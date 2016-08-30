var electron = require('electron');
var ipcMain = electron.ipcMain;
var servers = {};
var tr = (opts) => {
    if (!tr.orbita) {
        throw new Error("Please, set orbita before use orbita ipc server");
    }
    if (!servers[opts.address]) {
        var callbacks = {

        }
        ipcMain.on(opts.address, (event, name, data) => {
            if (callbacks[name]) {
                callbacks[name].map((cb) => {
                    cb(data);
                })
            }
        });
        servers[opts.address] = {
            in: (name, callback) => {
                if (!callbacks[name]) {
                    callbacks[name] = [];
                }
                callbacks[name].push(callback);
            },
            out: (name) => {
                return function (data) {
                    tr.orbita.send(opts.address, name, data);
                }
            }
        }
    }
    return servers[opts.address];
}
tr.orbita = null;
module.exports = tr