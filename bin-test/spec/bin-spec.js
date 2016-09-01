describe("Orbita CLI", () => {
    it("start", (done) => {
        require('child_process').exec('"node_modules/.bin/orbita" "./component-bin.js"', (error, stdout, stderr) => {
            if (error) {
                error.console = stderr;
                fail(error);
                done()
            }
            //expect(stdout.split(require('os').EOL)[1]).toBe(JSON.stringify(require('./../fixture1')));
            done();
        })
    })
})