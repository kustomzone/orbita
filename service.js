module.exports = (require, transports, serviceConfig) => {
    console.log(transports, serviceConfig);
    var resolvedTransports = {}
    for (var i in transports) {
        resolvedTransports[i] = require(transports[i]);
    }
    var nanoservice = require('nanoservice')({ transports: resolvedTransports });
    var service = require(serviceConfig.module);
    nanoservice(service, {
        transports: serviceConfig.transports,
        links: serviceConfig.links,
        env: {
            window: window
        }
    })
}