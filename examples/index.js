"use strict";
const React = require('react');
const _1 = require('./../');
let app = React.createElement(_1.App, null, 
    React.createElement(_1.BrowserWindow, {webPreferences: {}, url: __dirname + "/index.html", loadUrlOptions: { userAgent: "test" }})
);
