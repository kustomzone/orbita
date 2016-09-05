var _ = require('lodash');
var BrowserWindow = require('electron').BrowserWindow;
var defaultWindowOpts = require('./default-window-opts');
var controlWindow = require('./control-window');
var servicesLoader = require('./services-loader');
function create(windowConfig, errorCallback) {
    var opts = _.extend({
        transports: {}
    }, windowConfig.opts, defaultWindowOpts);
    var browserWindow = new BrowserWindow({ width: opts.width, height: opts.height, webPreferences: opts.webPreferences });
    var window = {
        id: windowConfig.id,
        config: windowConfig,
        opts: opts,
        browserWindow: browserWindow,
        controller: controlWindow(window, {
            onStart: () => {
                servicesLoader(window);
            },
            onError: errorCallback
        })
    }
    browserWindow.loadURL(windowConfig.url, { userAgent: opts.userAgent });
    var webContents = browserWindow.webContents;
    //Subscribe to crash and close for call error (unexpected behavior)
    webContents.on('crashed', function () {
        errorCallback("window was crashed");
    });
    browserWindow.on('close', function () {
        errorCallback("window was closed");
    });
    //Wait for window will be ready
    webContents.on('dom-ready', function () {
        window.controller.start();
    })
    return window;
}
function remove(window) {
    window.controller.stop();
    try {
        window.electronWindow.close();
    } catch (e) {
        return;
    }
}
module.exports = {
    create: create,
    remove: remove
}