var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;
var app = electron.app;
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
var deepExtend = require('deep-extend');

var defaultWindowOpts = {
    width: 1368,
    height: 768,
    webPreferences: {
        nodeIntegration: false,
        preload: __dirname + '/preload.js'
    },
    userAgent: "Mozilla/5.0 (Windows NT 6.4; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2225.0 Safari/537.36"
}

module.exports = function (component) {

    var windowOpts = deepExtend(defaultWindowOpts, component.opts);
    var state = component.state || {};
    var windows = {};
    app.on('ready', () => {
        rerender();
    })

    return {
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
            if (!needWindows[id]) {
                removeWindow(id);
            }
        }
        for (var id2 in needWindows) {
            if (!windows[id2]) {
                createWindow(needWindows[id2]);
            }
        }
    }
    function createWindow(windowConfig) {

        windowOpts = deepExtend(windowOpts, windowConfig.opts);
        var window = new BrowserWindow({ width: windowOpts.width, webPreferences: windowOpts.webPreferences });

        windows[windowConfig.id] = {
            id: windowConfig.id,
            window: window,
            config: windowConfig
        }
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
            delete windows[windowConfig.id];
            rerender();
        });

        window.webContents.on('dom-ready', function () {
            window.webContents.executeJavaScript("window.$$$require$$$(" + JSON.stringify(require.resolve(windowConfig.service)) + ")(window.$$$require$$$, " + JSON.stringify(windowConfig.args) + ");")
        })
    }
    function removeWindow(id) {
        windows[id].window.close();
        delete windows[id];
    }


}
