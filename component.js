var _ = require('lodash');
var electronApp = require('electron').app;
var Stater = require('./stater');
var Renderer = require('./renderer');
module.exports = () => {

    return (componentConfig) => {
        componentConfig = _.extend({
            state: null
        }, componentConfig)
        //Create renderer///////
        var renderer = Renderer();
        ////Create stater///////   
        var stater = Stater(componentConfig.state, () => {
        });
        //Subscribe to electron app ready        
        electronApp.on('ready', () => {
            var onChange = (state) => {
                renderer(componentConfig.render(state));
            };
            stater = Stater(stater.state, onChange)
            onChange(stater.state);
        });
        return {
            setState: stater
        }
        ////////////////////////
    }
}