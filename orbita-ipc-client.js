var ipcRenderer = require('electron').ipcRenderer;
module.exports = (opts) => {
    var callbacks = {

    }
    console.log("orbita ipc client", opts)
    ipcRenderer.on(opts.address, (event, name, data) => {
        console.log("event", name, data);
        if (callbacks[name]) {
            callbacks[name](data);
        }
    })

    return {
        in: function (name, callback) {
            console.log("link in ", opts.address, name)
            callbacks[name] = callback;
        },
        out: function (name) {
            console.log("link out ", opts.address, name)
            return function (data) {
                console.log("orbita out ", name, data)
                ipcRenderer.send(opts.address, name, data);
            }
        }
    }
}