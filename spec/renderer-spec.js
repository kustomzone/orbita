var mock = require('mock2');
var windowConf1 = { id: "id1" };
var windowConf2 = { id: "id2" };
var fixture1 = "fix1";
describe("Renderer", () => {
    var renderer, create, remove;
    beforeEach(() => {
        create = jasmine.createSpy();
        remove = jasmine.createSpy();
        renderer = mock.require('./../renderer', {
            './../windows': {
                create: create,
                remove: remove
            }
        })();
    })
    it("when needWindows is empty and current windows is filled, should create window with subscribe on error", () => {
        renderer([windowConf1, windowConf2]);
        expect(create.calls.allArgs()).toEqual([[windowConf1, jasmine.any(Function)], [windowConf2, jasmine.any(Function)]]);
    })
    it("when window emit error, should remove and create again", () => {
        create.and.returnValue(fixture1)
        renderer([windowConf1]);
        create.calls.argsFor(0)[1]();        
        expect(remove.calls.allArgs()).toEqual([[fixture1]]);
        expect(create.calls.count()).toBe(2);
    })
    it("when needWindows is empty and current windows is empty, should do nothing", () => {
        renderer();
        expect(create.calls.count()).toBe(0);
        expect(remove.calls.count()).toBe(0);
    })
    it("when needWindows is setted and current windows is filled without one window, should remove", () => {        
        renderer([windowConf1, windowConf2]);
        renderer([windowConf2]);
        expect(remove.calls.count()).toBe(1);
    })
    it("when needWindows is setted and current windows is filled by same window, should create only first time", () => {
        renderer([windowConf1]);
        renderer([windowConf1]);
        expect(create.calls.count()).toBe(1);
    })
})