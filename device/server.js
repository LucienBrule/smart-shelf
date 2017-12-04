var express = require('express'),
  nunjucks = require('nunjucks'),
  config = require("./config/config"),
  firebase = require("firebase"),
  routes = require('./src/routes'),
  app = express(),
  device = require('./src/device'),
  _ = require('./src/common');
api = require('./src/api');

var self = module.exports = {
  init: () => {
    return new Promise((resolve, reject) => {
      console.log("_____ starting _____")
      app.use(express.json())
      app.use('/', routes);
      app.use(express.static(__dirname + '/public'))
      app.use('/scripts', express.static(__dirname + '/node_modules/'))
      nunjucks.configure('views', {
        autoescape: true,
        express: app
      })
      firebase = firebase.initializeApp(config.firebase);
      // Determine runtime environment
      if (process.env.debug == "true") {
        console.log("DEBUG mode enabled ")
      }
      if (config.port) {
        app.port = config.port
      }
      else if (process.env.port) {
        app.port = config.port
      }
      else {
        app.port = 3001
      }
      device.init().then(resolve()).catch((err) => {
        console.log("---> The device could not initalize because")
        console.log(err.stack)
      })
      process.on('unhandledRejection', (reason, p) => {
        console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
      });
    });
  }
}
self.init().then(
  () => {
    console.log("Running on port: " + app.port);
    app.listen(app.port, () => console.log('Server listening on port: ' + app.port));
    console.log("_____ ready _____")

  }).catch((reason) => {
  console.log("The app could not initialize because:\n " + reason);
})
