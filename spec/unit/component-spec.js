var mock = require('mock2');
var fixture1 = "fix1";
var fixture2 = "fix2";
var fixture3 = "fix3";
describe("Component", () => {
    var componentModule, electronApp, stater, staterModule, component, rendererModule, renderer, render;
    beforeAll(() => {
        //create electron mock
        electronApp = jasmine.createSpyObj('app', ['on']);
        //Create stater mock
        staterModule = jasmine.createSpy();
        stater = jasmine.createSpy();
        staterModule.and.returnValue(stater);
        //create renderer mock
        rendererModule = jasmine.createSpy();
        renderer = jasmine.createSpy();
        rendererModule.and.returnValue(renderer);
        //component render spy
        render = jasmine.createSpy();
        componentModule = mock.require('./../../component', {
            './../../renderer': rendererModule,
            './../../stater': staterModule,
            'electron': { hhh: 16, app: electronApp }
        });
    })
    beforeEach(() => {
        //create component class        
        component = componentModule();
    })
    it("when created, should subscribe for electron ready", () => {
        component({ render: render });
        expect(electronApp.on.calls.allArgs()).toEqual([['ready', jasmine.any(Function)]]);
    })
    it("when created, should create renderer with right opts", () => {
        component();
        expect(rendererModule.calls.allArgs()).toEqual([[]]);
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
        component({ render: render, state: fixture3 });
        render.and.returnValue(fixture1);
        stater.state = fixture2;
        electronApp.on.calls.argsFor(0)[1]();
        expect(renderer.calls.allArgs()).toEqual([[fixture1]]);
        expect(render.calls.allArgs()).toEqual([[fixture2]]);
        //New change state
        renderer.calls.reset();
        staterModule.calls.argsFor(1)[1]();
        expect(renderer.calls.allArgs()).toEqual([[fixture1]]);
    })
    it("when main service setted, should create with nanoservice", () => {
        var nanoservice = jasmine.createSpy();
        component = componentModule(nanoservice);
        component({ main: { service: fixture1, config: fixture2 } });
        expect(nanoservice.calls.allArgs()).toEqual([[fixture1, fixture2]]);
    })
    afterEach(() => {
        staterModule.calls.reset();
        stater.calls.reset();
        rendererModule.calls.reset();
        renderer.calls.reset();
    })
})