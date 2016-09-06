var mock = require('mock2');
describe("BIN starter", () => {
    var child_processSpawn, child_processSpawnOn, electronPath, fixture2 = "fix2", oldProcessExit, oldProcessCwd;
    beforeAll(() => {
        oldProcessExit = process.exit;
        oldProcessCwd = process.cwd;
        process.exit = jasmine.createSpy();
        process.cwd = jasmine.createSpy();
        electronPath = "fixturePath";
        child_processSpawn = jasmine.createSpy();
        child_processSpawnOn = jasmine.createSpy();
        child_processSpawn.and.returnValue({
            on: child_processSpawnOn
        });
    })
    it("start", () => {
        process.argv = ["electron", "bin/bin-start.js", "arg1", "arg2", "arg3"];
        process.cwd.and.returnValue(fixture2);
        mock.require('./../../bin/bin-start', {
            'child_process': { spawn: child_processSpawn },
            'electron-prebuilt': electronPath
        });
        var args = process.argv.slice(2);
        args.unshift(require.resolve('./../../bin/bin.js'));
        expect(child_processSpawn.calls.allArgs()).toEqual([[electronPath, args, {
            cwd: fixture2,
            stdio: "inherit"
        }]]);
        expect(child_processSpawnOn.calls.allArgs()).toEqual([["close", jasmine.any(Function)]]);
        var fixtureCode = "code1";
        child_processSpawnOn.calls.argsFor(0)[1](fixtureCode);
        expect(process.exit.calls.allArgs()).toEqual([[fixtureCode]]);
    })
    afterAll(() => {
        process.exit = oldProcessExit;
        process.cwd = oldProcessCwd;
    })
})