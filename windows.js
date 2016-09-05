var _ = require('lodash');
var BrowserWindow = require('electron').BrowserWindow;
var defaultWindowOpts = require('./default-window-opts');
var controlWindow = require('./control-window');
function create(windowConfig, errorCallback) {
    var opts = _.extend({
        transports: {}
    }, windowConfig.opts, defaultWindowOpts);
    var browserWindow = new BrowserWindow({ width: opts.width, height: opts.height, webPreferences: opts.webPreferences });
    var window = {
        id: windowConfig.id,
        config: windowConfig,
        browserWindow: browserWindow,
        controller : controlWindow(window, {
            onStart: function(){},
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
    try {
        window.electronWindow.close();
    } catch (e) {

    }
}
module.exports = {
    create: create,
    remove: remove
}