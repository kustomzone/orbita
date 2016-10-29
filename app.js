"use strict";
const React = require('react');
const electron_1 = require('electron');
class ElectronApp extends React.Component {
    componentWillMount() {
        this.setState({ isReady: false });
        electron_1.app.on("ready", () => {
            this.setState((state) => {
                state.isReady = true;
                return state;
            });
        });
    }
    render() {
        return React.createElement("div", null, this.state.isReady ?
            (this.props.children ? this.props.children.map((child) => {
                return child;
            }) : null)
            : "Not ready");
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ElectronApp;
