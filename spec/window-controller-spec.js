var mock = require('mock2');
var fixture1 = "fix1";
describe("Window controller", () => {
    var electronIpcMain, WindowController, window, onStart, onError, events, executeJavaScript;
    beforeEach(() => {
        electronIpcMain = jasmine.createSpyObj("electronIpcMain", ["on", "removeAllListeners"]);
        WindowController = mock.require('./../window-controller', {
            'electron': { ipcMain: electronIpcMain }
        })
        executeJavaScript = jasmine.createSpy();
        window = {
            id: "id1",
            config: {
                id: "id1"
            },
            browserWindow: { webContents: { executeJavaScript: executeJavaScript } }
        }
        onStart = jasmine.createSpy();
        onError = jasmine.createSpy();
        events = { onStart: onStart, onError: onError };
    })
    it("when create and start controller without control script, should execute hack and call onStart", () => {
        jasmine.clock().install();
        WindowController(window, events).start();
        expect(executeJavaScript.calls.allArgs()).toEqual([["var test = 'test'"]]);
        jasmine.clock().tick(250);
        expect(events.onStart.calls.count()).toBe(1);
        jasmine.clock().uninstall();
    })
    it("when start with control script, should subscribe with ipcMain and execute script", () => {
        window.config.control = {
            args: fixture1,
            script: "./script1"
        }
        WindowController(window, events).start();
        expect(electronIpcMain.on.calls.allArgs()).toEqual([["ORBITA__CONTROL_" + window.config.id, jasmine.any(Function)]]);
        //load script
        var controlModulePath = require.resolve('./../window-controller-inside');
        var code = `window.$$$require$$$(${JSON.stringify(controlModulePath)})(window.$$$require$$$,${JSON.stringify(window.config.id)},${JSON.stringify(window.config.control.script)},${JSON.stringify(window.config.control.args)})`;
        expect(executeJavaScript.calls.allArgs()).toEqual([[code]]);
    })
    it("when start with control script, and get start-event from ipc should call onError", () => {
        window.config.control = {
            script: "./script1"
        }
        WindowController(window, events).start();
        electronIpcMain.on.calls.argsFor(0)[1](undefined, "start");
        expect(events.onStart.calls.count()).toBe(1);
    })
    it("when start with control script, and get error from ipc should call onError", () => {
        window.config.control = {
            script: "./script1"
        }
        WindowController(window, events).start();
        electronIpcMain.on.calls.argsFor(0)[1](undefined, "error", fixture1);
        expect(events.onError.calls.allArgs()).toEqual([[fixture1]]);
    })
    it("when call stop, should remove all listeners from ipc main", () => {
        var controller = WindowController(window);
        controller.stop();
        expect(electronIpcMain.removeAllListeners.calls.allArgs()).toEqual([["ORBITA__CONTROL_" + window.config.id]]);
    })
})