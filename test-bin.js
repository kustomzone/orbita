var component = require('./spec/component')
global['Orbita1'] = component;
console.log(component);
module.exports = component;
var Jasmine = require('jasmine');
var jasmine = new Jasmine();

jasmine.loadConfigFile('spec/support/jasmine.json');

jasmine.execute();
//TODO Create global test