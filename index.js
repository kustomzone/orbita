var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;
var app = electron.app;

var transportsModulePath = require.resolve('./transports');
var serviceModulePath = require.resolve('./service');

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('ready', () => {
    appOnReadyListeners.map((cb) => {
        cb();
    })
    appOnReady = function (cb) {
        cb();
    }
});
var appOnReadyListeners = [];
var appOnReady = function (cb) {
    appOnReadyListeners.push(cb);
}

var deepExtend = require('deep-extend');

var defaultWindowOpts = {
    width: 1368,
    height: 768,
    webPreferences: {
        nodeIntegration: false,
        preload: __dirname + '/preload.js'
    },
    userAgent: "Mozilla/5.0 (Windows NT 6.4; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2225.0 Safari/537.36",
    transports: {
        'orbita-ipc-client': require.resolve('./orbita-ipc-client')
    }
}
var gid = 0;
module.exports = function (component) {
    gid++;

    var orbitaID = "Orbita__" + gid + parseInt(Math.random() * 1000);

    var windowOpts = deepExtend(defaultWindowOpts, component.opts);
    var state = component.state || {};
    var windows = {};
    appOnReady(() => {
        rerender();
    });

    return {
        id: orbitaID,
        send: function (address, event, data) {
            console.log("send", address, event, data)
            for (var id in windows) {
                windows[id].window.webContents.send(address, event, data);
            }
        },
        setState: function (partialState) {
            var newState = {}
            for (var k in state) {
                newState[k] = state[k]
            }
            for (var i in partialState) {
                newState[i] = partialState[i]
            }
            if (JSON.stringify(state) !== JSON.stringify(newState)) {
                state = newState;
                rerender()
            }
        }
    }
    function rerender() {
        var needWindows = component.render.apply(undefined, [state]);
        for (var id in windows) {
            if (needWindows.filter((w) => {
                return w.id == id;
            }).length == 0) {
                removeWindow(id);
            }
        }
        needWindows.map((w) => {
            if (!windows[w.id]) {
                createWindow(w);
            }
        })
    }
    function createWindow(windowConfig) {
        appOnReady(() => {
            _createWindow(windowConfig)
        })
    }
    function _createWindow(windowConfig) {
        console.log("createWindow", windowConfig)
        windows[windowConfig.id] = {
            id: windowConfig.id,
            window: null,
            config: windowConfig
        }
        windowOpts = deepExtend(windowOpts, windowConfig.opts);
        var window = new BrowserWindow({ width: windowOpts.width, webPreferences: windowOpts.webPreferences });
        windows[windowConfig.id].window = window;


        window.loadURL(windowConfig.url, { userAgent: windowOpts.userAgent });

        window.openDevTools();
        window.webContents.on('did-fail-load', function () {
            removeWindow(windowConfig.id);
            rerender();
        });

        window.webContents.on('crashed', function () {
            removeWindow(windowConfig.id);
            rerender();
        })

        window.on('close', function () {
            removeWindow(windowConfig.id, true);
            rerender();
        });

        window.webContents.on('dom-ready', function () {
            if (windowConfig.services) {
                windowConfig.services.map((serviceConfig) => {
                    window.webContents.executeJavaScript("window.$$$require$$$(" + JSON.stringify(transportsModulePath) + ")(window.$$$require$$$," + JSON.stringify(windowOpts.transports) + ")")
                    window.webContents.executeJavaScript("window.$$$require$$$(" + JSON.stringify(serviceModulePath) + ")(window.$$$require$$$," + JSON.stringify(require.resolve(serviceConfig.module)) + ", " + JSON.stringify(serviceConfig.args) + ", " + JSON.stringify(serviceConfig.transports) + ", " + JSON.stringify(serviceConfig.links) + ");")
                })
            }

        })
    }
    function removeWindow(id, alreadyClosed) {
        if (!alreadyClosed) {
            console.log("Close window ", id)
            windows[id].window.close();
        }
        delete windows[id];
    }
}
