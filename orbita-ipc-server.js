var electron = require('electron');
var ipcMain = electron.ipcMain;
var servers = {};
module.exports = (orbita) => {
    return (opts) => {
        if (!servers[opts.address]) {
            var callbacks = {}
            ipcMain.on(opts.address, (event, name, data) => {
                if (callbacks[name]) {
                    callbacks[name].map((cb) => {
                        cb(data);
                    })
                }
                if (opts.always) {
                    orbita.send(opts.address, name, data);
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
                        orbita.send(opts.address, name, data);
                    }
                }
            }
        }
        return servers[opts.address];
    }
}