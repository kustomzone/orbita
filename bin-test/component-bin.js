
var call = 0;
module.exports = () => {    
    return {
        render: (state) => {
            var nanoservice = require('nanoservice');
            console.log("orbita", nanoservice.transports)
            call++;
            if (call == 2) {
                console.log(JSON.stringify(state));
                process.exit(0);
                return;
            }
            return []
        }
    }
}
global.orbita.onReady(() => {
    global.orbita.setState(require('./fixture1'))
})