var extend = require('deep-extend');
var electron = require('electron');
var app = electron.app;
var ipcMain = electron.ipcMain;

module.exports = (moduleConfig)=>{
    moduleConfig = extend({},moduleConfig);
}