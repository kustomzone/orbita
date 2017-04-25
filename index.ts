export { default as Window } from "./Window";
export { sel, attr, obj, css, val, text, html, child, hasClass } from "page-grabber";
export interface IWindowConfig {
    userDataDir?: string;
    proxy?: string;
    userAgent?: string;
}
