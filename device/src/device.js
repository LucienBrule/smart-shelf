var Datastore = require('nedb'),
  config = require.main.require("./config/config"),
  db = new Datastore({
    filename: config.device.dataStorePath,
    autoload: true
  }),
  _ = require.main.require('./src/common'),
  board

self = module.exports = {
  init: () => {
    return new Promise((resolve, reject) => {
      // Determine the environment
      if (process.env.device == "board") {
        config.env = "board"
        config.emulate_board = false;
      }
      if (process.env.device == "board-emulate") {
        config.env = "board"
        config.emulate_board = true
      }
      // If running in prod on the board, load bonscript else run mock
      if (config.env == "board") {
        if (config.emulate_board) {
          console.log("emulating the board")
          console.log("boar api is mocked: " + config.device.mockBoardAPI)
          board = require(config.device.mockBoardAPI)
        } else {
          console.log("using bonescript ")
          console.log("board api is: " + config.device.boardAPI)
          board = require(config.device.boardAPI);
        }
      }
      // Don't do stuff if we're on the dev machine
      // board.getPlatform((data)=>{
      //   console.log(`BOARD name ${data.name}`);
      //   console.log(`BOARD hostname ${data.os.hostname}`);
      //   console.log(`BOARD arch ${data.os.arch}`);
      // });
      // Register our control function interval timer
      setInterval(self.readSensors,config.device.sensorRefreshTime)

      // Register our even handlers for new data

      resolve();
    });
  },
  readSensors : () => {
    _.emitter.emit("DebugEvent","Tesing the event emitter");
    console.log("DEVICE: Reading sensors")
    var sensorPack = {timestamp:Date.now(),sensors:[]}
    console.log(config.device.sensors);
    console.log(config.device.sensors.length)
    for(var i = 0; i < config.device.sensors.length; i++){
      var sensor = config.device.sensors[i];
      if(sensor.type == "analog"){
        board.analogRead(sensor.pin,(data)=>{
          // console.log(`Read sensor ${sensor.name} : ${data.value.toFixed(4)}`);
          sensor.value = data.value;
          sensorPack.sensors.push(sensor);
        })
      }
    }
    _.emitter.emit("newSensorData",sensorPack);
    // console.log(sensorPack);
  }
}
