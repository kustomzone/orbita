var mock = require('mock-require');
var fixture1 = "path1";
var fixture2 = "path2";
var fixture3 = "path3";
var fixtureRelative1 = "./path4";
var fixtureAbsolute1 = "/path5";
describe("Resolve module path", () => {
    var resolve, path, pathResolve, requireResolve;
    beforeAll(() => {
        pathResolve = jasmine.createSpy();
        path = {
            resolve: pathResolve
        }
        requireResolve = jasmine.createSpy();
        mock('path', path);
        resolve = require('./../resolver')(fixture1, requireResolve);
    })
    it("when module path not exists should throw error with assigned path", () => {
        requireResolve.and.throwError("");
        expect(resolve.bind(undefined, fixtureRelative1)).toThrowError("Invalid resolve module path " + fixtureRelative1);
    })
    it("when module path is relative and module exists, result should be concat with basePath", () => {
        pathResolve.and.callFake((path) => {
            if (path === fixture1 + fixtureRelative1) {
                return fixture2;
            }
        });
        requireResolve.and.callFake((path) => {
            if (path === fixture2) {
                return fixture2;
            }
        });
        expect(resolve(fixtureRelative1)).toBe(fixture2);
    })
    it("when module path is npm-module, result should be concat basePath + node_modules + module path", () => {
        pathResolve.and.callFake((path) => {
            if (path === fixture1 + "/node_modules/" + fixture2) {
                return fixture3;
            }
        })
        requireResolve.and.callFake((path) => {
            if (path == fixture3) {
                return fixture3;
            }
        });
        expect(resolve(fixture2)).toBe(fixture3);
    })
    it("when module path has : or starts with /, should check and return as is", () => {
        pathResolve.and.returnValue(null);
        requireResolve.and.callFake((path) => {
            if (path == fixtureAbsolute1) {
                return fixtureAbsolute1;
            }
        })
        expect(resolve(fixtureAbsolute1)).toBe(fixtureAbsolute1);
    })
    afterAll(() => {
        mock.stopAll();
    })
})