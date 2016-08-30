var electron = require('electron');
var nanoservice = require('nanoservice');
var path = require('path');
var orbitaIPCServerTransport = require('./orbita-ipc-server');
nanoservice.use("orbita-ipc-server", orbitaIPCServerTransport);
nanoservice.use("orbita", orbitaIPCServerTransport);

var BrowserWindow = electron.BrowserWindow;
var app = electron.app;
var ipcMain = electron.ipcMain;
var transportsModulePath = require.resolve('./transports');
var serviceModulePath = require.resolve('./service');
var controlModulePath = require.resolve('./control');

app.on('window-all-closed', function () {
    app.quit();
});

var u = {
    appOnReady: function (cb) {
        appOnReadyListeners.push(cb);
    }
}

app.on('ready', () => {
    u.appOnReady = function (cb) {
        cb();
    }
    appOnReadyListeners.map((cb) => {
        cb();
    })

});
var appOnReadyListeners = [];


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
        'orbita': require.resolve('./orbita-ipc-client')
    }
}
var gid = 0;
module.exports = function (component) {

    gid++;

    var orbitaID = "Orbita__" + gid + parseInt(Math.random() * 1000);

    var windowOpts = deepExtend(defaultWindowOpts, component.opts);
    var state = component.state || {};
    var windows = {};
    u.appOnReady(() => {
        rerender();
    });

    var orb = {
        id: orbitaID,
        send: function (address, event, data) {
            console.log("send", address, event, data)
            for (var id in windows) {
                windows[id].window.webContents.send(address, event, data);
            }
        },
        setState: function (partialState) {
            if (typeof partialState === "function") {
                partialState = partialState(state);
            }
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

    //Set orbita to Orbita transport
    orbitaIPCServerTransport.orbita = orb;

    function rerender() {

        var needWindows = component.render.apply(orb, [state]);
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
        windows[windowConfig.id] = {};
        u.appOnReady(() => {
            _createWindow(windowConfig)
        })
    }
    function _createWindow(windowConfig) {
        windows[windowConfig.id] = {
            id: windowConfig.id,
            window: null,
            config: windowConfig
        }
        windowOpts = deepExtend(windowOpts, windowConfig.opts);
        var window = new BrowserWindow({ width: windowOpts.width, height: windowOpts.height, webPreferences: windowOpts.webPreferences });
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

        var onLoaded = () => {
            if (windowConfig.services) {
                windowConfig.services.map((serviceConfig) => {
                    serviceConfig.links = serviceConfig.links || [];
                    serviceConfig.transports = serviceConfig.transports || {};
                    if (serviceConfig.on) {
                        serviceConfig.transports["____ORBITA_ON"] = { type: "orbita", opts: { address: "____ORBITA_ON" + windowConfig.id } }

                        var sLinks = [];
                        var sIns = {};
                        for (var outLinkName in serviceConfig.on) {
                            serviceConfig.links.push({ transport: "____ORBITA_ON", name: outLinkName, to: outLinkName, type: "out" })
                            sIns[outLinkName] = (function (callback, data) {
                                callback.apply(this, [data]);
                            }).bind(orb, serviceConfig.on[outLinkName]);
                            sLinks.push({ transport: "t", name: outLinkName, to: outLinkName, type: "in" })
                        }

                        nanoservice({ in: sIns }, {
                            transports: { "t": { type: "orbita-ipc-server", opts: { address: "____ORBITA_ON" + windowConfig.id } } },
                            links: sLinks
                        })
                    }

                    //Add server for every orbita transport
                    for (var tn in serviceConfig.transports) {
                        if (serviceConfig.transports[tn].type == "orbita") {
                            orbitaIPCServerTransport(serviceConfig.transports[tn].opts);
                        }
                    }

                    var serviceCModulePath = serviceConfig.module;
                    var realServiceModulePath;
                    if (serviceCModulePath.substr(0, 1) !== "/" && serviceCModulePath.indexOf(":") === -1) {
                        if (serviceCModulePath.substr(0, 1) === ".") {
                            realServiceModulePath = path.resolve(process.cwd() + serviceCModulePath);
                        } else {
                            realServiceModulePath = path.resolve(process.cwd() + "/node_modules/" + serviceCModulePath);
                        }
                    } else {
                        realServiceModulePath = serviceCModulePath;
                    }
                    try {
                        realServiceModulePath = require.resolve(realServiceModulePath);
                    }
                    catch (e) {
                        throw new Error("Invalid service module path " + serviceCModulePath)
                    }

                    window.webContents.executeJavaScript("window.$$$require$$$(" + JSON.stringify(transportsModulePath) + ")(window.$$$require$$$," + JSON.stringify(windowOpts.transports) + "); window.$$$require$$$(" + JSON.stringify(serviceModulePath) + ")(window.$$$require$$$," + JSON.stringify(realServiceModulePath) + ", " + JSON.stringify(serviceConfig.args) + ", " + JSON.stringify(serviceConfig.transports) + ", " + JSON.stringify(serviceConfig.links) + ");")
                })
            }
        }

        ipcMain.on("ORBITA__CONTROL_" + windowConfig.id, (e, event, result) => {
            console.log("Control event:: ", event, result)
            switch (event) {
                case "start":
                    onLoaded();
                    break;
                case "error":
                    console.error(result);
                    removeWindow(windowConfig.id);
                    rerender();
                    break;
                default:
                    console.error("Unknown event ", event)
            }
        })

        window.webContents.on('dom-ready', function () {
            if (windowConfig.control) {
                window.webContents.executeJavaScript("window.$$$require$$$(" + JSON.stringify(controlModulePath) + ")(window.$$$require$$$," + JSON.stringify(windowConfig.id) + "," + JSON.stringify(require.resolve(windowConfig.control.script)) + "," + JSON.stringify(windowConfig.control.args) + ")");
            } else {
                onLoaded();
            }
        })
    }

    function removeWindow(id, alreadyClosed) {
        console.log("want remove window", id);
        if (!windows[id]) {
            return;
        }
        console.log("remove window", id);
        var w = windows[id].window;
        delete windows[id];
        ipcMain.removeAllListeners("ORBITA__CONTROL_" + id);
        ipcMain.removeAllListeners("____ORBITA_ON" + id);
        if (!alreadyClosed) {
            console.log("Close window ", id)
            w.close();
        }
    }

    return orb;
}

