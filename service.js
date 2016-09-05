module.exports = (require, serviceConfig) => {
    var nanoservice = require('nanoservice');
    var service = require(serviceConfig.module)(serviceConfig.args);
    nanoservice(service, {
        transports: serviceConfig.transports,
        links: serviceConfig.links
    })
}