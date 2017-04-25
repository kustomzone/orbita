export { default as Window } from "./Window";
export { sel, attr, obj, css, val, text, html, child, hasClass } from "page-grabber";
export interface IWindowConfig {
    userDataDir?: string;
    proxy?: string;
    userAgent?: string;
}
export interface ICommandOpts {
    timeout?: number;
}
export interface IWaitForElementOpts extends ICommandOpts {
    pollingTimeout?: number;
}
export interface IClickOpts extends IWaitForElementOpts {
    offsetXPercent?: number;
    offsetYPercent?: number;
}
export interface IInputOpts extends IWaitForElementOpts {
    charTimeout?: number;
}
