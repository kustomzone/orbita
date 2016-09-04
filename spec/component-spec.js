var mock = require('mock-require');
var fixture1 = "fix1";
var fixture2 = "fix2";
describe("Component", () => {
    var componentModule, electronApp, stater, staterModule, component, rendererModule, renderer, render;
    beforeAll(() => {
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
        //component render spy
        render = jasmine.createSpy();
    })
    beforeEach(() => {
        //create component class
        componentModule = require('./../component');
        component = componentModule();
    })
    it("when created, should subscribe for electron ready", () => {
        component({ render: render });
        expect(electronApp.on.calls.allArgs()).toEqual([['ready', jasmine.any(Function)]]);
    })
    it("when created, should create renderer with right opts", () => {
        component();
        expect(rendererModule.calls.allArgs()).toEqual([[jasmine.any(Object)]]);
    })
    it("when created, should create stater with assigned state", () => {
        component({ state: fixture1, render: render });
        expect(staterModule.calls.count()).toBe(1);
        expect(staterModule.calls.argsFor(0)[0]).toBe(fixture1);
        expect(staterModule.calls.argsFor(0)[1]).toEqual(jasmine.any(Function));
        expect(rendererModule.calls.count()).toBe(1);
    })
    it("when call setState, should run stater", () => {
        var component1 = component({ render: render });
        component1.setState(fixture1);
        expect(stater.calls.count()).toBe(1);
    })
    it("when state was changed and electron ready, should run render two times and call renderer with result", () => {
        component({ render: render, state: fixture2 });
        render.and.returnValue(fixture1);
        staterModule.calls.argsFor(0)[1]();
        stater.state = fixture2;
        electronApp.on.calls.argsFor(0)[1]();
        expect(renderer.calls.allArgs()).toEqual([[fixture1]]);        
        expect(render.calls.allArgs()).toEqual([[fixture2]]);
        //New change state
        renderer.calls.reset();
        staterModule.calls.argsFor(0)[1]();
        expect(renderer.calls.allArgs()).toEqual([[fixture1]]);

    })
    it("when state changed and electron not ready, should save state and call after ready", () => {

    })
    afterEach(() => {
        staterModule.calls.reset();
        stater.calls.reset();
        rendererModule.calls.reset();
        renderer.calls.reset();
    })
    afterAll(() => {
        mock.stopAll();
    })
})