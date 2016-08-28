# Orbita: framework for Atom/Electron with reactive windows controller and nanoservice's support
[![Build Status](https://travis-ci.org/arvitaly/orbita.svg?branch=master)](https://travis-ci.org/arvitaly/orbita)
[![npm version](https://badge.fury.io/js/orbita.svg)](https://badge.fury.io/js/orbita)
# What is it?

Orbita is component, like React, but for electron windows. It has `state` and method `render`. You can change state by method `setState` and if state was changed, orbita will run `render`. 
Method `render` should return array of windows options, like as `id`, `url` etc.
After calling `render` orbita compare current opened windows and result of `render` by `id`, then close old windows and create new.

Also, orbita supported nanoservice (https://github.com/arvitaly/node-nanoservice), and two transports `orbita-ipc-server` and `orbita-ipc-client`. So, you can work with many window and main process in single workflow. Every window is one nanoservice.

So,  you create orbita-component with settings for controll windows and messages, forget it, and work for bussiness logic.

# Install

    //First, install Electron in global, now Orbita works with 1.3.4 version
    npm install electron-prebuilt -g
    //or you can install Electron as dependence and write in package.json script, like {"start" :"electron index.js"}
    npm install electron-prebuilt --save
    //Install Orbita
    npm install orbita@1.1.0 --save

# Example of usage
    var orbita = require('orbita');
    //create orbita component
    var orbita1 = orbita({
            //initial state
            state: {
                test: 28,
                fix: fixture1
            },
            //render state-->windows
            render: (state) => {
                return [{
                    //unique id
                    id: state.test == 28 ? "w1" : "w2",
                    //starting url
                    url: __dirname + "/index.html",
                    //Control script, which can send start and error event                    
                    control:{
                        script: __dirname + "/control.js",
                        args: {
                            test: "value"
                        }
                    },                    
                    //you can create many nanoservices for one window
                    services:[{
                        ////path to service for create nanoservice
                        module: __dirname + "/service1.js",
                        //args for creating service
                        args: state.fix + state.test,
                        //transports for nanoservice
                        transports: {
                            "tr1": {
                                "type": "orbita-ipc-client",
                                opts: {
                                    address: "addr1"
                                }
                            }
                        },
                        //links for nanoservice
                        links: [
                            {
                                type: "in",
                                name: "in1",
                                to: "event2",
                                transport: "tr1"
                            },
                            {
                                type: "out",
                                name: "out1",
                                to: "event1",
                                transport: "tr1"
                            }
                        ]
                    }]
                }]
            }
        })
        //Change state
        orbita1.setState({ test: fixture2 });
        //......
        
        //create nanoservice in main process
        var service1 = nanoservice({
                    in: {
                        "in1": (args) => {
                            setTimeout(() => {
                                cb1(args + fixture1);
                            }, 100);
                        },
                        "in2": (args) => {
                            //!!!Args collected through all events = (fixture2 + fixture1 + fixture1 + fixture2);
                            
                        }
                    },
                    out: {
                        "out1": (cb) => {
                            cb1 = cb;
                        }
                    }
                }, {
                //use orbita transport
                        transports: { "t1": { "type": "orbita-ipc-server", opts: { address: "addr1", orbita: orbita } } },
                        links: [{ transport: "t1", type: "out", name: "out1", to: "event2" }, { transport: "t1", type: "in", name: "in2", to: "event1" }]
                    });
                //Start messaging
                service1.emit("in1", fixture2);

# Tranports

Every window in orbita can use any transport by nanoservice functional (like, socket, ipc, websocket, http, etc.)
