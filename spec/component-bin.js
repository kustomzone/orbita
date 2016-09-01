var orbita = require('orbita');
module.exports = () => {
    return {
        render: () => {
            if (!orbita.app) {
                console.log("Not found global app for orbita");
                process.exit(1);
                return;
            }

            process.exit(0);
            return []
        }
    }
}