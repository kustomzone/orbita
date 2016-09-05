var mock = require('mock2');
xdescribe("Integration", () => {
    var orbita;
    beforeEach(() => {
        orbita = mock.require("./../../index",{
            'electron': require('./__mocks__/electron')
        });
    })
    it("when orbita start, should create windows by state", () => {
        orbita();
    })
})