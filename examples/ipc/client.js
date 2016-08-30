var ipc = require('node-ipc');
ipc.config.id = 'hello';
ipc.config.retry = 1500;
var address = "addr1";
ipc.connectTo(address, function () {
    console.log("connected");
    ipc.of[address].on('event1', function (data) {
        console.log(data);
    })
})