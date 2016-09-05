var mock = require('mock2');
var fixture1 = "fix1";
describe("Orbita module Index", () => {
    var electronApp;
    var orbitaModule;
    var component;
    beforeAll(() => {
        electronApp = jasmine.createSpyObj('app', ['on', 'quit']);
        component = jasmine.createSpy();
        orbitaModule = mock.require('./../../index', {
            './../../component': component,
            'electron': {
                app: electronApp
            }
        });
    })
    it("when module loaded, should created component", () => {
        component.and.returnValue(fixture1)
        var component1 = orbitaModule();
        expect(component1).toBe(fixture1);
    })
    it("when run as global, app should quitted when all windows closed", () => {
        orbitaModule({ runAsGlobal: true });
        //Check subscribed all-window-closed 
        expect(electronApp.on.calls.count()).toBe(1);
        expect(electronApp.on.calls.argsFor(0)[0]).toBe("window-all-closed");
        electronApp.on.calls.argsFor(0)[1]();
        expect(electronApp.quit.calls.count()).toBe(1);
    })
})