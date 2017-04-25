"use strict";
class MockProcess {
    constructor() {
        this.destroy = jest.fn();
        MockProcess.lastInstantiate = this;
    }
    static getLastInstantiate() {
        return MockProcess.lastInstantiate;
    }
}
module.exports = {
    default: MockProcess
};
