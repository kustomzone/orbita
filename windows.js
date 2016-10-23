var extend = require('deep-extend');
var BrowserWindow = require('electron').BrowserWindow;
var defaultWindowOpts = require('./default-window-opts');
var controlWindow = require('./window-controller');
var servicesLoader = require('./services-loader');
function create(windowConfig, orbitaWindowOpts, errorCallback) {
    //global.__o_log("create window", windowConfig);
    var opts = extend({
        transports: {}
    }, defaultWindowOpts, orbitaWindowOpts, windowConfig.opts);
    var browserWindow = new BrowserWindow({ width: opts.width, height: opts.height, webPreferences: opts.webPreferences });
    var window = {
        id: windowConfig.id,
        config: windowConfig,
        opts: opts,
        browserWindow: browserWindow,
        controller: null,
        isClosed: false
    };
    window.controller = controlWindow(window, {
        onStart: () => {
            servicesLoader(window);
        },
        onError: errorCallback
    });
    browserWindow.loadURL(windowConfig.url, { userAgent: opts.userAgent });
    var webContents = browserWindow.webContents;
    //Subscribe to crash and close for call error (unexpected behavior)
    webContents.on('crashed', function () {
        errorCallback("window was crashed");
    });
    browserWindow.on('close', function () {
        window.isClosed = true;
        errorCallback("window was closed");
    });
    webContents.on('did-finish-load', function () {
        window.controller.start();
    })
    webContents.on('did-fail-load', function () {
        global.__o_log("did-fail-load");
    })
    //did-fail-load    

    //Wait for window will be ready
    webContents.on('dom-ready', function () {


    })
    return window;
}
function remove(window) {
    if (window && window.controller) {
        window.controller.stop();
    }
    if (window && !window.isClosed) {
        window.browserWindow.close();
    }
}
module.exports = {
    create: create,
    remove: remove
}