var resolve = require('resolve-module-path');
var transportsModulePath = resolve('./transports');
var serviceModulePath = resolve('./service');
module.exports = (window) => {
    if (!window.config.services) {
        return;
    }
    //window.browserWindow.webContents.executeJavaScript("window.$$$require$$$(" + JSON.stringify(transportsModulePath) + ")(window.$$$require$$$," + JSON.stringify(window.opts.transports) + ");");
    window.config.services.map((serviceConfig) => {
        serviceConfig.links = serviceConfig.links || [];
        serviceConfig.transports = serviceConfig.transports || {};
        window.browserWindow.webContents.executeJavaScript("window.$$$require$$$(" + JSON.stringify(serviceModulePath) + ")(window.$$$require$$$," + JSON.stringify(transportsModulePath) + "," + JSON.stringify(serviceConfig) + ");")
    });
}