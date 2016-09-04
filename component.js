var _ = require('lodash');
var electronApp = require('electron').app;
var Stater = require('./stater');
var Renderer = require('./renderer');
module.exports = () => {
    var defaultWindowOpts = {
        width: 1368,
        height: 768,
        webPreferences: {
            nodeIntegration: false,
            preload: __dirname + '/preload.js'
        },
        userAgent: "Mozilla/5.0 (Windows NT 6.4; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2225.0 Safari/537.36",
        transports: {
            'orbita': require.resolve('./orbita-ipc-client')
        }
    }
    return (componentConfig) => {
        componentConfig = _.extend({
            state: null
        }, componentConfig)
        //Create renderer///////
        var renderer = Renderer(defaultWindowOpts);
        ////Create stater///////        
        var saver = { onChangeState: null };
        var stater = Stater(componentConfig.state, (state) => {
            console.log(saver);
            if (saver.onChangeState) {
                saver.onChangeState(state);
            }
        });
        //Subscribe to electron app ready        
        electronApp.on('ready', () => {
            
            saver.onChangeState = (state) => {
                renderer(componentConfig.render(state));
            }
            console.log("saver2", saver);
            saver.onChangeState(stater.state);
        });
        return {
            setState: stater
        }
        ////////////////////////
    }
}