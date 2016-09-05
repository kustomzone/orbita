var mock = require('mock2');
describe("Windows", () => {
    var windows, loadURL, webContents, WindowController, servicesLoader, controllerStop, controllerStart, errorCallback, BrowserWindow, defaultWindowOpts;
    beforeEach(() => {
        loadURL = jasmine.createSpy();
        WindowController = jasmine.createSpy();
        servicesLoader = jasmine.createSpy();
        controllerStop = jasmine.createSpy();
        controllerStart = jasmine.createSpy();
        errorCallback = jasmine.createSpy();
        BrowserWindow = jasmine.createSpy();
        webContents = jasmine.createSpyObj("webContents", ["on"]);
        defaultWindowOpts = {
            transports: { "tr1": "transport1" }
        };
        windows = mock.require('./../../windows', {
            electron: {
                BrowserWindow: BrowserWindow
            },
            "./../../window-controller": WindowController,
            "./../../services-loader": servicesLoader,
            "./../../default-window-opts": defaultWindowOpts
        });
    })
    it("when remove non-closed window and electronWindow closed not throwed error, should worked as is", () => {
        var electronClose = jasmine.createSpy();
        windows.remove({
            browserWindow: { close: electronClose },
            controller: {
                stop: controllerStop
            }
        });
        expect(controllerStop.calls.count()).toBe(1);
        expect(electronClose.calls.allArgs()).toEqual([[]]);
    })
    it("when remove non-closed window and electron closed throw error, should catch it", () => {
        var electronClose = jasmine.createSpy();
        electronClose.and.throwError("");
        windows.remove({
            browserWindow: { close: electronClose },
            controller: {
                stop: controllerStop
            }
        });
        expect(electronClose.calls.allArgs()).toEqual([[]]);
    })
    it("when window create, should subscribe on close, crashed, loadURL, start controller and return window", () => {
        var windowOn = jasmine.createSpy();
        var browserWindow = {
            loadURL: loadURL,
            webContents: webContents,
            on: windowOn
        };
        BrowserWindow.and.returnValue(browserWindow);
        var windowConfig = {
            id: "id1", opts: {
                transports: {
                    tr2: "transport2"
                }
            }
        };
        //create window controller
        var controller = {
            start: controllerStart
        };
        WindowController.and.returnValue(controller);
        var expectedWindow = {
            id: "id1",
            config: windowConfig,
            opts: {
                transports: {
                    tr1: defaultWindowOpts.transports.tr1,
                    tr2: windowConfig.opts.transports.tr2
                }
            },
            browserWindow: browserWindow,
            controller: controller
        }
        //Start test
        var window = windows.create(windowConfig, errorCallback);
        expect(window).toEqual(expectedWindow);
        //Check controller creating
        expect(WindowController.calls.allArgs()).toEqual([[expectedWindow, { onStart: jasmine.any(Function), onError: jasmine.any(Function) }]]);
        //Check subscribes on browser
        expect(webContents.on.calls.allArgs()).toEqual([["crashed", jasmine.any(Function)], ["dom-ready", jasmine.any(Function)]]);
        expect(windowOn.calls.allArgs()).toEqual([["close", jasmine.any(Function)]]);
        //Call crash
        webContents.on.calls.argsFor(0)[1]();
        expect(errorCallback.calls.count()).toBe(1);
        errorCallback.calls.reset();
        //Call close
        windowOn.calls.argsFor(0)[1]();
        expect(errorCallback.calls.count()).toBe(1);
        //Call dom ready
        webContents.on.calls.argsFor(1)[1]();
        expect(controllerStart.calls.count()).toBe(1);
        //Controller call onStart
        WindowController.calls.argsFor(0)[1].onStart();
        expect(servicesLoader.calls.allArgs()).toEqual([[expectedWindow]]);
    })
})