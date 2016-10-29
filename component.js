var _ = require('lodash');
var electronApp = require('electron').app;
var Stater = require('./stater');
var Renderer = require('./renderer');
var Nanoservice = require('nanoservice');
module.exports = () => {
    var nanoservice = Nanoservice({
        transports: {}
    });
    var component = (componentConfig) => {
        componentConfig = _.extend({
            state: null,
            main: null,
            opts: {},
            config: {

            }
        }, componentConfig);
        //Create renderer///////
        var renderer = Renderer(componentConfig.opts);
        ////Create stater///////   
        var stater = Stater(componentConfig.state, () => { });
        var ret = {
            setState: stater
        }
        if (componentConfig.config.paths) {
            for (var p in componentConfig.config.paths) {
                electronApp.setPath(p, componentConfig.config.paths[p]);
            }
        }
        //electronApp.commandLine.appendSwitch("enable-logging", '2');
        electronApp.on('window-all-closed', () => {
            //app.quit()
        })
        //Subscribe to electron app ready        
        electronApp.on('ready', () => {
            var onChange = (state) => {
                renderer(componentConfig.render(state));
            };
            ret.setState = Stater(stater.state, onChange)
            onChange(stater.state);
        });

        //Create main service
        if (componentConfig.main) {
            if (componentConfig.opts.transports) {
                for (var i in componentConfig.opts.transports) {
                    nanoservice.use(i, require(componentConfig.opts.transports[i]));
                }
            }
            try {
                nanoservice(componentConfig.main.service, componentConfig.main.config);
            } catch (e) {
                global.__o_log(e, e.stack);
                process.exit(1);
                return;
            }
        }
        return ret;
        ////////////////////////
    }
    var orbitaTransport = require('./orbita-ipc-server')(component);
    component.transport = orbitaTransport;
    nanoservice.use("orbita", orbitaTransport);
    return component;
}