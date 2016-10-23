var _ = require('lodash');
var electron = require('electron');
var app = electron.app;
var component = require('./component');
module.exports = (moduleConfig) => {
    moduleConfig = _.extend({
        runAsGlobal: false,
        log: console.log
    }, moduleConfig);
    global.__o_log = moduleConfig.log;
    var comp = component();
    /*if (moduleConfig.runAsGlobal) {
        app.on('window-all-closed', function () {
            app.quit();
        });
    }*/
    return comp;
}