var mock = require('mock2');
describe("Integration", () => {
    var orbita, BrowserWindow, browserWindowLoadURL, browserWindowOn, webContentsOn, browserWindow;
    beforeEach(() => {
        BrowserWindow = jasmine.createSpy();
        browserWindowLoadURL = jasmine.createSpy();
        browserWindowOn = jasmine.createSpy();
        webContentsOn = jasmine.createSpy();
        browserWindow = {
            loadURL: browserWindowLoadURL,
            webContents: {
                on: webContentsOn
            },
            on: browserWindowOn
        };
        orbita = mock.require("./../../index", {
            './../../orbita-ipc-server': jasmine.createSpy(),
            'electron': {
                app: {
                    on: jasmine.createSpy()
                }
            },
            './../../component': mock.require('./../../component', {
                'electron': {
                    app: {
                        on: (event, cb) => {
                            cb();
                        }
                    }
                },
                './../../renderer': mock.require('./../../renderer', {
                    './../../windows': mock.require('./../../windows', {
                        'electron': {
                            BrowserWindow: BrowserWindow
                        },
                        './../../window-controller': mock.require('./../../window-controller', {
                            'electron': {}
                        })
                    })
                })
            })
        });
    })
    it("when orbita start, should create windows by state", () => {
        var Component = orbita();
        BrowserWindow.and.returnValue(browserWindow);
        var url1 = "http://url/";
        Component({
            render: () => {
                return [{
                    id: "id1",
                    url: url1
                }]
            }
        })
        expect(browserWindow.loadURL.calls.count()).toBe(1);
        expect(browserWindow.loadURL.calls.argsFor(0)[0]).toBe(url1);
    })
})