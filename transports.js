module.exports = (require, transports) => {
    var nanoservice = require('nanoservice');
    for (var tr in transports) {
        nanoservice.use(tr, require(transports[tr]));
    }
}