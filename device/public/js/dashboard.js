firebase.initializeApp(config);
var sensorValues = [];
$.ajax({
  type: "GET",
  url: "/api/get-auth-credential/",
  success: (data) => {
    console.log("GET SUCESS");
    console.log(data);
    firebase.auth().signInWithCredential(data).catch(function(error) {
      console.log(error);
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;

    });
  },
  error: (data) => {
    console.log("GET FAILED");
    console.log(error)
  }
})

firebase.auth().onAuthStateChanged(function(firebaseUser) {
  if (firebaseUser) {
    console.log("Logged in")
      // var div = document.getElementById('data-pile').innerHTML += "logged in"
    console.log(JSON.stringify(firebaseUser))
    auth = firebaseUser;
    onFirebaseSignIn();
  }
  else {
    console.log("Signed out");
  }
});

function addSensorsToGraph(data) {
  // console.log("add sensors to graph")
  // console.log(data);
  for (var i in data.sensors) {
    var sensor = data.sensors[i]
    if (groups[sensor.name] == null) {
      groups[sensor.name] = {
        value: 0,
        color: 'orange',
        data: d3.range(limit).map(function() {
          return 0
        })
      }
      groups[sensor.name].path = paths.append('path')
        .data(groups[sensor.name].data)
        .attr('class', sensor.name + ' group')
        .style('stroke', groups[sensor.name].color)
    }
    groups[sensor.name].data.push(parseFloat(sensor.value) * 100);
    // groups[sensor.name].data.push(20 + Math.random() * 100)


  }
  tick();
}

function addSensorsToDump(data) {
  // console.log("add sensors to dump")
  // console.log(data)
  var domnode = document.getElementById("data-pile");
  if (domnode) {
    domnode.innerHTML += `<span class='data-item'>
          <b>${data.timestamp}</b>
          ${data.sensors[0].name} : ${data.sensors[0].value}
          ${data.sensors[1].name} : ${data.sensors[1].value}
          ${data.sensors[2].name} : ${data.sensors[2].value}
          ${data.sensors[3].name} : ${data.sensors[3].value}
          </span> <br/>`;

  }
}


function getLocalSensorData() {
  var data_p = new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "/api/get-sensor-data/",
      success: (data) => resolve(data),
      error: (err) => {
        console.log(err), reject(err)
      },
    });
  });
  data_p.then((data) => {
    data = JSON.parse(data);
    console.log(data);
    addSensorsToGraph(data)
    addSensorsToDump(data)
  })
}

setInterval(getLocalSensorData,1000);

function onFirebaseSignIn() {
  var deviceId_promise = new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "/api/get-device-id/",
      success: (data) => resolve(data),
      error: (err) => {
        console.log(err), reject(err)
      },
    });
  });
  Promise.resolve(deviceId_promise).then((deviceId) => {
    var userRef = '/users/' + firebase.auth().currentUser.uid;
    var dataRef = firebase.database().ref(userRef + '/devices/' + deviceId + '/data/');
    // console.log(dataRef);
    dataRef.on('child_added', function(data) {
      // console.log("got some new data")
      var data = data.val();
      addSensorsToGraph(data);
      var domnode = document.getElementById("data-pile");
      if (domnode) {
        domnode.innerHTML += `<span class='data-item'>
          <b>${data.timestamp}</b>
          ${data.sensors[0].name} : ${data.sensors[0].value}
          ${data.sensors[1].name} : ${data.sensors[1].value}
          ${data.sensors[2].name} : ${data.sensors[2].value}
          ${data.sensors[3].name} : ${data.sensors[3].value}
          </span> <br/>`;

      }
    });
  })

}
