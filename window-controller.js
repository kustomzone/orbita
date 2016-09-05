var ipcMain = require('electron').ipcMain;
//Resolve path for require control-module inside window
var controlModulePath = require.resolve('./window-controller-inside');
module.exports = (window, events) => {
    return {
        start: () => {
            //Subscribe on 
            ipcMain.on("ORBITA__CONTROL_" + window.config.id, (e, event, result) => {
                switch (event) {
                    case "start":
                        events.onStart();
                        break;
                    case "error":
                        events.onError(result);
                        break;
                    default:
                        console.error("Unknown event ", event)
                }
            });
            //Load started script or stub (it is need, because electron has unexpected error with preload)
            if (window.config.control) {
                window.browserWindow.webContents.executeJavaScript("window.$$$require$$$(" + JSON.stringify(controlModulePath) + ")(window.$$$require$$$," + JSON.stringify(windowConfig.id) + "," + JSON.stringify(require.resolve(window.config.control.script)) + "," + JSON.stringify(window.config.control.args) + ")");
            } else {
                window.browserWindow.executeJavaScript("var a = 'unknown error with preload require'");
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
