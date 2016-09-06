module.exports = (require, transports, serviceConfig) => {
    var nanoservice = require('nanoservice')({ transports: transports });
    var service = require(serviceConfig.module);
    nanoservice(service, {
        transports: serviceConfig.transports,
        links: serviceConfig.links,
        env: {
            window: window
        }
    })
}