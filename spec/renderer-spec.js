var mock = require('mock-require');
var windowConf1 = { id: "id1" };
var windowConf2 = { id: "id2" };
describe("Renderer", () => {
    var Windows, renderer;
    beforeAll(() => {
        Windows = jasmine.createSpyObj("windows", ["create", "remove"]);
        mock('./../windows', Windows);
        renderer = require('./../renderer')();
    })
    it("when needWindows is empty and current windows is empty, should do nothing", () => {
        renderer();
        expect(Windows.create.calls.count()).toBe(0);
        expect(Windows.remove.calls.count()).toBe(0);
    })
    it("when needWindows is empty and current windows is filled, should create window", () => {
        renderer([windowConf1, windowConf2]);
        expect(Windows.create.calls.allArgs()).toEqual([[windowConf1], [windowConf2]]);
    })
    it("when needWindows is setted and current windows is filled without one window, should remove", () => {
        renderer([windowConf1, windowConf2]);
        renderer([windowConf2])
        expect(Windows.remove.calls.allArgs()).toEqual([[windowConf1]]);
    })
    it("when needWindows is setted and current windows is filled by same window, should create only first time", () => {
        renderer([windowConf1]);
        renderer([windowConf1])
        expect(Windows.create.calls.allArgs()).toEqual([[windowConf1]]);
    })    
    afterEach(() => {
        Windows.create.calls.reset();
        Windows.remove.calls.reset();
    })
})