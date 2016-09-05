var mock = require('mock2');
var windowConf1 = { id: "id1" };
var windowConf2 = { id: "id2" };
describe("Renderer", () => {
    var renderer, window, create, remove;
    beforeEach(() => {
        window = jasmine.createSpyObj("window", ["on"]);
        create = jasmine.createSpy();
        create.and.returnValue(window);
        remove = jasmine.createSpy();
        renderer = mock.require('./../renderer', {
            './../windows': {
                create: create,
                remove: remove
            }
        })();
    })
    it("when needWindows is empty and current windows is filled, should create window", () => {
        renderer([windowConf1, windowConf2]);
        expect(create.calls.allArgs()).toEqual([[windowConf1], [windowConf2]]);
    })
    it("when window emit error, should remove and create again", () => {
        renderer([windowConf1]);
        expect(window.on.calls.allArgs()).toEqual([["error", jasmine.any(Function)]]);
        window.on.calls.argsFor(0)[1]();
        expect(remove.calls.allArgs()).toEqual([[{ electronWindow: window, config: windowConf1 }]]);
        expect(create.calls.allArgs()).toEqual([[windowConf1], [windowConf1]]);
    })
    it("when needWindows is empty and current windows is empty, should do nothing", () => {
        renderer();
        expect(create.calls.count()).toBe(0);
        expect(remove.calls.count()).toBe(0);
    })

    it("when needWindows is setted and current windows is filled without one window, should remove", () => {
        renderer([windowConf1, windowConf2]);
        renderer([windowConf2])
        expect(remove.calls.allArgs()).toEqual([[{ electronWindow: window, config: windowConf1 }]]);
    })
    it("when needWindows is setted and current windows is filled by same window, should create only first time", () => {
        renderer([windowConf1]);
        renderer([windowConf1])
        expect(create.calls.allArgs()).toEqual([[windowConf1]]);
    })
    afterEach(() => {
        create.calls.reset();
        remove.calls.reset();
    })
})