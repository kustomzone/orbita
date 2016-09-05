var mock = require('mock2');
var fixture1 = { "fix1": "test" };
var fixture2 = { "fix2": "test2" };
var fixture3 = { "fix3": "test3" };
describe("Services loader", () => {
    var loader, window, executeJavaScript;
    beforeEach(() => {
        executeJavaScript = jasmine.createSpy();
        loader = mock.require("./../../services-loader");
        window = {
            opts: {
                transports: fixture1
            },
            config: { services: [fixture2, fixture3] },
            browserWindow: {
                webContents: {
                    executeJavaScript: executeJavaScript
                }
            }
        }
    })
    it("when call should execute script for every service", () => {
        var transportsModulePath = require.resolve('./../../transports');
        var serviceModulePath = require.resolve('./../../service');
        loader(window);
        var expected = window.config.services.map((serviceConfig) => {
            return [`window.$$$require$$$(${JSON.stringify(serviceModulePath)})(window.$$$require$$$,${JSON.stringify(serviceConfig)});`];
        });
        expected.unshift([`window.$$$require$$$(${JSON.stringify(transportsModulePath)})(window.$$$require$$$,${JSON.stringify(window.opts.transports)});`]);
        expect(executeJavaScript.calls.allArgs()).toEqual(expected);
    })
    it("when services is empty, should do nothing", () => {
        delete window.config.services;
        loader(window);
        expect(executeJavaScript.calls.count()).toBe(0);
    })
})