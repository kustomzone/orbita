var mock = require('mock2');
var path = require('path');
describe("bin", () => {
    beforeAll(() => {

    })
    it("when load with config", () => {
        var component = jasmine.createSpy();
        var commander = jasmine.createSpy();
        commander.version = () => { return commander };
        commander.option = () => { return commander };
        commander.parse = () => { };
        commander.basePath = path.resolve(path.join(__dirname, './../fixtures/bin1'));
        commander.configFile = "./config.json";
        mock.require('./../../bin/bin', {
            './../../index': jasmine.createSpy(),
            './../fixtures/bin1/index': component,
            commander: commander
        });
        expect(component.calls.allArgs()).toEqual([[{
            "test": "test1"
        }]]);
    })
})