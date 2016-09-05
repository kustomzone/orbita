/*var windows = require('./../../windows');
describe("Windows", () => {
        
    it("when remove non-closed window and electronWindow closed not throwed error, should worked as is", () => {
        var electronClose = jasmine.createSpy();
        windows.remove({
            electronWindow: { close: electronClose }
        });
        expect(electronClose.calls.allArgs()).toEqual([[]]);
    })
    it("when remove non-closed window and electron closed throw error, should catch it", () => {
        var electronClose = jasmine.createSpy();
        electronClose.and.throwError("");
        windows.remove({
            electronWindow: { close: electronClose }
        });
        expect(electronClose.calls.allArgs()).toEqual([[]]);
    })
})*/