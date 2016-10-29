"use strict";
const React = require('react');
const electron_1 = require('electron');
class BrowserWindowComponent extends React.Component {
    componentWillMount() {
        this.setState({
            window: null
        });
    }
    createWindow() {
        let window = new electron_1.BrowserWindow(this.props);
        window.on("crash", () => {
            this.destroyWindow();
            this.setState({ window: null });
            if (this.props.isAutoRecreateOnCrash === true) {
                this.createWindow();
            }
        });
        if (this.props.url) {
            window.loadURL(this.props.url, this.props.loadUrlOptions || undefined);
        }
    }
    destroyWindow() {
        if (this.state.window) {
            if (this.state.window.isClosable()) {
                try {
                    this.state.window.close();
                }
                catch (e) {
                }
            }
        }
    }
    render() {
        return React.createElement("div", null);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BrowserWindowComponent;
