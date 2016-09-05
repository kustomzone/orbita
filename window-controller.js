var ipcMain = require('electron').ipcMain;
var resolver = require('resolve-module-path');
//Resolve path for require control-module inside window
var controlModulePath = resolver('./window-controller-inside');

module.exports = (window, events) => {
    return {
        start: () => {
            //Load started script
            if (window.config.control) {
                //Subscribe on 
                ipcMain.on("ORBITA__CONTROL_" + window.config.id, (e, event, result) => {
                    switch (event) {
                        case "start":
                            events.onStart();
                            break;
                        case "error":
                            events.onError(result);
                            break;
                    }
                });
                window.browserWindow.webContents.executeJavaScript("window.$$$require$$$(" + JSON.stringify(controlModulePath) + ")(window.$$$require$$$," + JSON.stringify(windowConfig.id) + "," + JSON.stringify(require.resolve(window.config.control.script)) + "," + JSON.stringify(window.config.control.args) + ")");
            } else {
                //or stub (it is need, because electron has unexpected error with preload)
                
                window.browserWindow.executeJavaScript("var test = 'test'");
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 200)
                });
            }
        },
        stop: () => {
            ipcMain.removeAllListeners("ORBITA__CONTROL_" + window.config.id);
        }
    }
}        
