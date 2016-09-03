var mock = require('mock-require');
var fixture1 = "fix1";
describe("Component", () => {
    var componentModule, electronApp, stater, staterModule, component, rendererModule, renderer;
    beforeEach(() => {
        //create electron mock
        electronApp = jasmine.createSpyObj('app', ['on']);
        mock('electron', { app: electronApp });
        //Create stater mock
        staterModule = jasmine.createSpy();
        stater = jasmine.createSpy();
        staterModule.and.returnValue(stater);
        mock('./../stater', staterModule);
        //create renderer mock
        rendererModule = jasmine.createSpy();
        renderer = jasmine.createSpy();
        rendererModule.and.returnValue(renderer);
        mock('./../renderer', rendererModule);
        //create component class        
        componentModule = require('./../component');
        component = componentModule();
    })
    it("when created, should create stater with assigned state", () => {
        component({
            state: fixture1
        });
        expect(staterModule.calls.count()).toBe(1);
        expect(staterModule.calls.argsFor(0)[0]).toBe(fixture1);
        expect(staterModule.calls.argsFor(0)[1]).toEqual(jasmine.any(Function));
    })
    it("when created, should create renderer with right opts", () => {
        component();
        expect(rendererModule.calls.count()).toBe(1);
    })
    it("when call setState, should run stater", () => {
        var component1 = component();
        component1.setState(fixture1);
        expect(stater.calls.count()).toBe(1);
    })
    it("when created, should wait for electron ready, and start first render", () => {

    })
    afterEach(() => {
        mock.stopAll()
    })
})