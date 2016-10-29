import * as React from 'react';
import { App, BrowserWindow } from './../';
let app = <App>
    <BrowserWindow webPreferences={{}} url={__dirname + "/index.html"} loadUrlOptions={{ userAgent: "test" }} />
</App>
