// Initialize Firebase
// TODO: don't store secrets in the config on github, but TBH these aren't that secret b/c the clients get served them anyway.
// would be good to have an example config \(",)/
module.exports= {
  env:"board",
  port:5000,
  emulate_board :true,
  firebase :{
    apiKey: "AIzaSyCOaZ9tsQKDrL7batXIU9lr7N4A4aydkes",
    authDomain: "smart-fridge-shelf.firebaseapp.com",
    databaseURL: "https://smart-fridge-shelf.firebaseio.com",
    projectId: "smart-fridge-shelf",
    storageBucket: "smart-fridge-shelf.appspot.com",
    messagingSenderId: "2482262027"
  },
  firebaserefs:{
    debugDataPath:"/users/lDKu7HgC8GQklFeJ21Fyim3jy2B3/devices/-KyOp-uCFCHGoRgkzALa/",
    deviceRef:"/-KyOp-uCFCHGoRgkzALa/",
    shouldTakeMeasurement: "/users/lDKu7HgC8GQklFeJ21Fyim3jy2B3/devices/-KyOp-uCFCHGoRgkzALa/shouldTakeMeasurement"
  },
  device :{
    uniqueName:"MajesticDiscoUnicorn",
    sensorPath:"./config/sensors/",
    sensorfilename:"weightsensor",
    datastorePath:"./config/datastore/datastore",
    generatedConfig:"./config/generatedConfig/",
    boardAPI:"bonescript",
    mockBoardAPI:"./mock/mock-bonescript",
    sigmaDelta: 0.1,
    refreshTokenTime : 3000,
    sensorRefreshTime: 3000,
    sensors: [
      {"pin":"P9_33","type":"analog","name":"Q1"},
      {"pin":"P9_35","type":"analog","name":"Q2"},
      {"pin":"P9_37","type":"analog","name":"Q3"},
      {"pin":"P9_39","type":"analog","name":"Q4"}
    ]
  },
  oauth:{
    client_id:"2482262027-4tm7n5ai7329g9100k5n3cgftdgovi1v.apps.googleusercontent.com"
  }
};
