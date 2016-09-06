var mock = require('mock2');
var fixture1 = "fix1", fixture2 = "fix2";
describe("Orbita module Index", () => {
    var electronApp, orbitaModule, component, orbitaIpcServer, Nanoservice, nanoservice;
    beforeAll(() => {
        Nanoservice = jasmine.createSpy();
        nanoservice = jasmine.createSpy();
        Nanoservice.and.returnValue(nanoservice);
        nanoservice.use = jasmine.createSpy();
        electronApp = jasmine.createSpyObj('app', ['on', 'quit']);
        component = jasmine.createSpy();
        orbitaIpcServer = jasmine.createSpy();
        orbitaModule = mock.require('./../../index', {
            './../../component': component,
            './../../orbita-ipc-server': orbitaIpcServer,
            'nanoservice': Nanoservice,
            'electron': {
                app: electronApp
            }
        });
    })
    it("when module loaded, should created component and transport", () => {
        component.and.returnValue(fixture1);
        orbitaIpcServer.and.returnValue(fixture2);
        var component1 = orbitaModule();
        expect(component1).toBe(fixture1);
        expect(orbitaIpcServer.calls.allArgs()).toEqual([[component1]]);
        expect(nanoservice.use.calls.allArgs()).toEqual([["orbita", fixture2]])
    })
    it("when run as global, app should quitted when all windows closed and global.orbita should setted", () => {
        var component1 = orbitaModule({ runAsGlobal: true });
        //Check subscribed all-window-closed 
        expect(electronApp.on.calls.count()).toBe(1);
        expect(electronApp.on.calls.argsFor(0)[0]).toBe("window-all-closed");
        electronApp.on.calls.argsFor(0)[1]();
        expect(electronApp.quit.calls.count()).toBe(1);
        expect(global.orbita).toBe(component1);
    })
})