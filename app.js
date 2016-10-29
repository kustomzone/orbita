"use strict";
const React = require('react');
class ElectronApp extends React.Component {
    render() {
        return React.createElement("div", null, this.props.children);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ElectronApp;
