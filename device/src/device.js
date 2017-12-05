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
          console.log("board api is mocked: " + config.device.mockBoardAPI)
          board = require(config.device.mockBoardAPI)
        }
        else {
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
      setInterval(self.readSensors, config.device.sensorRefreshTime)

      // Register our even handlers for new data
      _.emitter.on("shouldReadSensors", self.handle_should_read_sensors)
      _.emitter.on("newSensorData", self.calculateDeltas)

      resolve();
    });
  },
  sigmaDelta: config.device.sigmaDelta,
  oldSensorPack: null,
  calculateDeltas: (newSensorPack) => {
    // console.log("DEVICE: Calculating deltas")
    if (self.oldSensorPack == null) {
      self.oldSensorPack = newSensorPack;
      return
    }
    var deltas = [];
    var deltaPack = {}
    for (var i = 0; i < newSensorPack.sensors.length; i++) {
      deltas[i] = new Promise((resolve, reject) => {
        var delta = newSensorPack.sensors[i].value - self.oldSensorPack.sensors[i].value;
        // console.log(JSON.stringify(newSensorPack.sensors[i].value) + " - " + JSON.stringify(self.oldSensorPack.sensors[i].value) + " = " + delta)

        if (isNaN(delta)) {
          delta = 0.0;
        }
        resolve(delta)
      })
    }
    Promise.all(deltas).then((values) => {
      // console.log(values)
      const reducer = (accumulator, currentValue) => accumulator + currentValue;
      var sum = values.reduce(reducer)
      var num = deltas.length
      var meanDelta = sum / num;
      if (isNaN(meanDelta)) {
        meanDelta = 0.0;
      }
      deltaPack["avg"] = meanDelta;
      deltaPack["d_sensors"] = values;
      deltaPack["d_timestamp"] = newSensorPack.timestamp - self.oldSensorPack.timestamp
      deltaPack["timestamp"] = Date.now()
        // console.log(deltaPack)
        // console.log(self.oldSensorPack)
      var either = false;
      if (meanDelta > self.sigmaDelta) {
        either = true;
        _.emitter.emit("itemProbablyAdded", deltaPack);
        console.log("DEVICE: delta avg: " + deltaPack.avg)

      }
      else if ((-1 * meanDelta) > self.sigmaDelta) {
        either = true;
        _.emitter.emit("itemProbablyRemoved", deltaPack);
        console.log("DEVICE: delta avg: " + deltaPack.avg)

      }
      if(either){
        _.emitter.emit("itemProbablyChanged",deltaPack)
      }
      self.oldSensorPack = newSensorPack;



    })
  },
  readSensors: (opt) => {

    // console.log("DEVICE: Reading sensors")
    var sensorPack = {
      tstart: Date.now()
    }
    var sensorReadings = config.device.sensors.map((sensor) => {
      return new Promise((resolve, reject) => {
        var report = {}
        if (sensor.type == "analog") {
          board.analogRead(sensor.pin, (data) => {
            if (data.err) {
              console.log(data.err);
              reject(new Error('couldnt read sensor'));
            }
            if (data.value) {
              // console.log(`Read sensor ${sensor.name} : ${data.value.toFixed(4)}`);
              report["value"] = data.value;
              report["name"] = sensor.name;
              resolve(report);
            }
          });
        }
      })
    });

    Promise.all(sensorReadings).then((values) => {
        sensorPack["timestamp"] = Date.now();
        sensorPack["sensors"] = values;
        // console.log(sensorPack);
        var buf = ""
        for (var sensor in sensorPack.sensors) {
          buf += sensorPack.sensors[sensor].name + ": " + sensorPack.sensors[sensor].value.toFixed(3) + " "
        }
        console.log("DEVICE: new sensor data: " + buf);
        if (opt && opt.noNotify) {
          _.emitter.emit("newSensorData.noNotify", sensorPack);

        }
        else {
          _.emitter.emit("newSensorData", sensorPack);

        }
      })
      // console.log(sensorPack);
  },
  handle_should_read_sensors: (opt) => {
    self.readSensors(opt);
  }
}
