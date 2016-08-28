module.exports = (require, servicePath, args, transports, links) => {
    var nanoservice = require('nanoservice');
    nanoservice.use('orbita-ipc-client', require('./orbita-ipc-client')(require));
    var service = require(servicePath)(args);

    nanoservice(service, {
        transports: transports,
        links: links
    })
}