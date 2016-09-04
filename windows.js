var _ = require('lodash');
var defaultWindowOpts = require('./default-window-opts');
function createWindow(windowConfig) {
    var window = {
        id: windowConfig.id,
        electronWindow: null
    }
    var opts = _.extend({
        transports: {}
    }, windowConfig.opts, defaultWindowOpts);

    return window;
}
function removeWindow() {

}
module.exports = {
    create: createWindow,
    remove: removeWindow
}