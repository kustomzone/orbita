//executing in main process
var resolve = require('resolve-module-path');
var serviceModulePath = resolve('./service');
module.exports = (window) => {
    if (!window.config.services) {
        return;
    }
    window.config.services.map((serviceConfig) => {
        serviceConfig.links = serviceConfig.links || [];
        serviceConfig.transports = serviceConfig.transports || {};
        try {
            window.browserWindow.webContents.send("load-script", serviceModulePath, window.opts.transports, serviceConfig, (err) => {
                try {
                    var ipcRenderer = require('electron').ipcRenderer;
                    ipcRenderer.send("ORBITA__CONTROL_" + window.id, "error", err)
                } catch (e) {
                    console.error(e);
                }
            });
        } catch (e) {
            try {
                var ipcRenderer = require('electron').ipcRenderer;
                ipcRenderer.send("ORBITA__CONTROL_" + window.id, "error", e)
            } catch (e) {
                console.error(e);
            }
        }
        //window.browserWindow.webContents.executeJavaScript("window.$$$require$$$(" + JSON.stringify(serviceModulePath) + ")(window.$$$require$$$," + JSON.stringify(window.opts.transports) + "," + JSON.stringify(serviceConfig) + ");")

    });
}