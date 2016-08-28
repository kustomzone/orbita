var ipcRenderer = require('ipc-renderer');
module.exports = (opts) => {
    var callbacks = {

    }
    console.log("orbita ipc client", opts)
    ipcRenderer.on(opts.address, (event, name, data) => {
        console.log("event", event, name, data, callbacks);
        if (callbacks[name]) {
            callbacks[name](data);
        }
    })

    return {
        in: function (name, callback) {
            callbacks[name] = callback;
        },
        out: function (name) {
            return function (data) {
                console.log("orbita out ", name, data)
                ipcRenderer.send(opts.address, name, data);
            }
        }
    }
}