module.exports = (require, servicePath, args, transports, links) => {
    var nanoservice = require('nanoservice');
    var service = require(servicePath)(args);
    nanoservice(service, {
        transports: transports,
        links: links
    })
}