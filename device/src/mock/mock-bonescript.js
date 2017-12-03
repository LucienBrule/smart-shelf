var os = require('os');
var self = module.exports = {
  getPlatform: function(callback) {
    var platform = {
      'platform': "MOCK-bone",
      'name': "MOCK-BeagleBone",
      'bonescript': "MOCK-bonescript",
      'os': {}
    };
    platform.os.hostname = os.hostname();
    platform.os.type = os.type();
    platform.os.arch = os.arch();
    platform.os.release = os.release();
    platform.os.uptime = os.uptime();
    platform.os.loadavg = os.loadavg();
    platform.os.totalmem = os.totalmem();
    platform.os.freemem = os.freemem();
    platform.os.networkInterfaces = os.networkInterfaces();
    if (callback) callback(platform);
    return (platform);
  },
  mockAnalogData: [
    0.9557997558,
    0.9557997558,
    0.9557997558,
    0.9565323565,
    0.9567765568,
    0.9567765568,
    0.9555555556,
    0.9565323565,
    0.957020757,
    0.9562881563,
    0.9562881563,
    0.9565323565,
    0.957020757,
    0.9565323565,
    0.9565323565,
    0.9565323565,
    0.9557997558,
    0.9557997558,
    0.956043956,
    0.9562881563,
    0.9567765568,
    0.9557997558,
    0.9548229548,
    0.9557997558,
    0.956043956
  ],
  analogRead: (pin, callback) => {

    var data = {
      value: self.mockAnalogData[Math.floor(Math.random() * (self.mockAnalogData.length - 0))]
    }
    if (callback) callback(data);

    return data;
  }
}
