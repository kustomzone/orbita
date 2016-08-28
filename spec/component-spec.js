var electron = require('electron');
var ipcMain = electron.ipcMain;
var Orbita = require('./../component')
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
describe("Windows controller", () => {
    it("orbita", (done) => {
        var fixture1 = "dfgk6hu95et";
        var fixture2 = "testfklgjdfg";
        var orbita = Orbita({
            state: {
                test: 28,
                fix: fixture1
            },
            render: (state) => {
                return [{
                    id: state.test == 28 ? "w1" : "w2",
                    url: __dirname + "/index.html",
                    args: state.fix + state.test,
                    service: __dirname + "/service1.js"
                }]
            }
        })
        setTimeout(() => {
            orbita.setState({ test: fixture2 })
            ipcMain.on("testipc", (event, data) => {
                expect(data).toBe(fixture1 + fixture2);
                done();
            })
        }, 1000)
    })
})