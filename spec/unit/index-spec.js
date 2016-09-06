var mock = require('mock2');
var fixture1 = "fix1";
describe("Orbita module Index", () => {
    var electronApp, orbitaModule, component, orbitaIpcServer;
    beforeAll(() => {
        electronApp = jasmine.createSpyObj('app', ['on', 'quit']);
        component = jasmine.createSpy();
        orbitaIpcServer = jasmine.createSpy();
        orbitaModule = mock.require('./../../index', {
            './../../component': component,
            './../../orbita-ipc-server': orbitaIpcServer,
            'electron': {
                app: electronApp
            }
        });
    })
    it("when module loaded, should created component and transport", () => {
        component.and.returnValue(fixture1)
        var component1 = orbitaModule();
        expect(component1).toBe(fixture1);
        expect(orbitaIpcServer.calls.allArgs()).toEqual([[component1]]);
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