module.exports = (require, transports, serviceConfig) => {
    try {
        var resolvedTransports = {}
        for (var i in transports) {
            resolvedTransports[i] = require(transports[i]);
        }
        var nanoservice = require('nanoservice')({ transports: resolvedTransports });
        var service = require(serviceConfig.module);
        nanoservice(service, {
            transports: serviceConfig.transports,
            args: serviceConfig.args,
            links: serviceConfig.links,
            env: {
                window: window
            }
        })
    } catch (e) {
        console.error(e, e.stack);
    }
}