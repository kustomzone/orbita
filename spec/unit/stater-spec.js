var stater = require('./../../stater')
var fixture1 = "fix1";
var fixture2 = "fix2";
var fixture3 = "fix3";
var fixtureObj1 = { test: fixture2 };

describe("Stater", () => {
    var onChange;
    beforeEach(() => {
        onChange = jasmine.createSpy();
    })
    it("when initial state was null, should call onChange", () => {
        stater(null, onChange)(fixture1);
        expect(onChange.calls.allArgs()).toEqual([[fixture1]]);
    })
    it("when state setted, state getter should be set", () => {
        var stater1 = stater(fixture1, onChange)
        stater1(fixture2);
        expect(stater1.state).toBe(fixture2);
    })
    it("when initial state and new state equal, should not call onChange", () => {
        stater(fixture1, onChange)(fixture1);
        expect(onChange.calls.count()).toBe(0);
    })
    it("when initial state is plain object, new state should extend it", () => {
        var s = stater(fixtureObj1, onChange);
        s({ test2: fixture3 });
        expect(onChange.calls.allArgs()).toEqual([[{ test: fixture2, test2: fixture3 }]]);
        onChange.calls.reset();
        s({ test: fixture2, test2: fixture3 });
        expect(onChange.calls.count()).toBe(0);
    })
    it("when partial state is function, then call it and set result as partial state ", () => {
        var partialState = jasmine.createSpy();
        partialState.and.returnValue(fixture2)
        var s = stater(fixture1, onChange);
        s(partialState);
        partialState.and.returnValue(fixture2)
        s(partialState);
        expect(onChange.calls.allArgs()).toEqual([[fixture2]])
    })
})