console.log("Start jasmine tests")
var Orbita = require('./index')
var component = require('./spec/component')
global['Orbita1'] = Orbita(component)

var Jasmine = require('jasmine');
var jasmine = new Jasmine();

jasmine.loadConfigFile('spec/support/jasmine.json');

jasmine.execute();