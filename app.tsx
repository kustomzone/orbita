import * as React from 'react';
import BrowserWindowComponent from './browser-window';
import { app } from 'electron';

export interface IProps {
    
}
interface IState {
    isReady: boolean;
}
class ElectronApp extends React.Component<IProps, IState>{
    componentWillMount() {
        this.setState({ isReady: false });
        app.on("ready", () => {
            this.setState((state) => {
                state.isReady = true;
                return state;
            })
        })
    }
    render() {
        return <div>{
            this.state.isReady ?
                (
                    this.props.children ? this.props.children.map((child) => {
                        return child;
                    }) : null)
                : "Not ready"
        }</div>
    }
}
export default ElectronApp;