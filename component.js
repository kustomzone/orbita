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
            main: null
        }, componentConfig)
        //Create renderer///////
        var renderer = Renderer();
        ////Create stater///////   
        var stater = Stater(componentConfig.state, () => { });
        var ret = {
            setState: stater
        }
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
            nanoservice(componentConfig.main.service, componentConfig.main.config);
        }
        return ret;
        ////////////////////////
    }
    var orbitaTransport = require('./orbita-ipc-server')(component);
    component.transport = orbitaTransport;
    nanoservice.use("orbita", orbitaTransport);
    return component;
}