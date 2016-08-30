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

    //First, install orbita, now works with 0.37.2 version of Electron
    npm install orbita@1.4.2 -g
    //start app, if not set script, orbita will find main module in package.json or just take index.js
    orbita app.js

# Example of usage
    //app.js    
    //create orbita component
    module.exports =({
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
                        //internal subscribe to service
                        on:{
                            serviceOutEvent: function(){
                                //Access to `orbita` and change state
                                this.setState({ test: fixture2 });
                            }
                        },
                        //transports for nanoservice
                        transports: {
                            "tr1": {
                                "type": "orbita",
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
        //Nanoservice in main process
        nanoservice({
            in:{
                ev:(data)=>{
                    //data from page-service for out-link out1 connected by "orbita" transport
                }
            }
        },{
            transports:{"t":{"type":"orbita",opts:{"address":"addr1"}}}
            links:[{transport:"t", name:"ev",to:"event1", type:"in"}]
        })
        
        

# Tranports

Every window in orbita can use any transport by nanoservice functional (like, socket, ipc, websocket, http, etc.)
