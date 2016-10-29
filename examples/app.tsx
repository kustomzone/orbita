import * as React from 'react';
import { App, BrowserWindow, create } from './../';
let app = <App>
    <BrowserWindow isAutoRecreateOnClose={true} webPreferences={{}} url={__dirname + "/index.html"} loadUrlOptions={{ userAgent: "test" }} />    
</App>
create(app);