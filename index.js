var _ = require('lodash');
var electron = require('electron');
var app = electron.app;
var component = require('./component');
var Nanoservice = require('nanoservice');
module.exports = (moduleConfig) => {
    moduleConfig = _.extend({
        runAsGlobal: false
    }, moduleConfig);
    var nanoservice = Nanoservice({
        transports: {}
    });
    var comp = component(nanoservice);
    if (moduleConfig.runAsGlobal) {
        app.on('window-all-closed', function () {
            app.quit();
        });
        global.orbita = comp;
    }
    var orbitaTransport = require('./orbita-ipc-server')(comp);
    comp.transport = orbitaTransport;
    nanoservice.use("orbita", orbitaTransport);
    return comp;
}