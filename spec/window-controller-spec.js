var mock = require('mock2');
describe("Window controller", () => {
    var electronIpcMain, WindowController, window;
    beforeEach(() => {
        electronIpcMain = jasmine.createSpyObj("electronIpcMain", ["on", "removeAllListeners"]);
        WindowController = mock.require('./../window-controller', {
            'electron': { ipcMain: electronIpcMain }
        })
        window = {
            id: "id1",
            config: {},
            browserWindow: { webContents: jasmine.createSpyObj("webContents", ["executeJavaScript"]) }
        }
    })
    fit("when create and start controller without control script, should execute hack and call onStart", () => {
        WindowController(window).start()
    })
})