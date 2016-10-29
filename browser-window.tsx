import * as React from 'react';
import { BrowserWindow } from 'electron';
interface IProps extends Electron.BrowserWindowOptions {
    isAutoRecreateOnCrash?: boolean;
    isAutoReacreateOnClose?: boolean;
    url?: string;
    loadUrlOptions?: Electron.LoadURLOptions;
}
interface IState {
    window: Electron.BrowserWindow;
}
class BrowserWindowComponent extends React.Component<IProps, IState>{
    componentWillMount() {
        this.setState({
            window: null
        })
    }
    createWindow() {
        let window = new BrowserWindow(this.props);
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
                } catch (e) {

                }
            }
        }
    }
    render() {
        return <div></div>
    }
}
export default BrowserWindowComponent;