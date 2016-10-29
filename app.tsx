import * as React from 'react';
import BrowserWindowComponent from './browser-window';


export interface IProps {

}
interface IState {

}
class ElectronApp extends React.Component<IProps, IState>{
    render() {
        return <div>{this.props.children}</div>
    }
}
export default ElectronApp;