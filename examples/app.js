"use strict";
const React = require('react');
const _1 = require('./../');
let app = React.createElement(_1.App, null, 
    React.createElement(_1.BrowserWindow, {isAutoRecreateOnClose: true, webPreferences: {}, url: __dirname + "/index.html", loadUrlOptions: { userAgent: "test" }})
);
_1.create(app);
