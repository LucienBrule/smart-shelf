const config = require.main.require("./config/config"),
  firebase = require("firebase"),
  fs = require('fs'),
  Datastore = require('nedb'),
  storage = require('node-persist'),
  _ = require.main.require('./src/common')
var storage_ready = storage.init({
    dir: config.device.generatedConfig
  }),
  db = new Datastore({
    filename: config.device.datastorePath,
    autoload: true
  }),
  fdb = {},
  self = module.exports = {
    is_logged_in_to_firebase: false,
    current_auth_credential: {},
    SUCCESS: {
      "status": "ok"
    },
    FAILURE: {
      "status": "error"
    },
    handle_sensor_data: (data) => {
      if (!self.is_logged_in_to_firebase) return;


      if (process.env.silent == "true") {
        // console.log("Not reporting to firebase")
        return
      }
      // console.log(data);

      if (process.env.quiet == "true") {
        // console.log("Not reporting to firebase")
        return
      }
      var sensorDataRef = fdb.ref(config.firebaserefs.debugDataPath + "/data")
      var newDataRef = sensorDataRef.push();
      newDataRef.set(data);
    },
    handle_item_probably_added: (data) => {
      if (!self.is_logged_in_to_firebase) return;
      console.log("API: Item probably added")

      if (process.env.silent == "true") {
        // console.log("Not reporting to firebase")
        return
      }
      var dataRef = fdb.ref(config.firebaserefs.debugDataPath + "/deltas")
      var newDataRef = dataRef.push();
      newDataRef.set(data);

    },
    handle_item_probably_removed: (data) => {
      if (!self.is_logged_in_to_firebase) return;
      console.log("API: Item probably removed")

      if (process.env.silent == "true") {
        // console.log("Not reporting to firebase")
        return
      }
      var dataRef = fdb.ref(config.firebaserefs.debugDataPath + "/deltas")
      var newDataRef = dataRef.push();
      newDataRef.set(data);

    },
    get_firebase_config: (req, res) => {
      //TODO: This is pretty dirty maybe dont do this
      // avoids having to have yet ANOTHER config file
      res.status(200).send("var config = " + JSON.stringify(config.firebase));
    },
    is_logged_in: (req, res) => {
      var status = self.is_logged_in_to_firebase;
      if (_.isRequest(req, res)) {
        res.send(status);
      }
      return status;
    },
    get_device_id: (req, res) => {
      res.send(config.firebaserefs.deviceRef);
    },
    logout: (req, res, next) => {
      storage_ready.then(() => {
        storage.removeItem("id_token", (err) => {
          firebase.auth().signOut().then(() => {
            console.log("User signed out")
          });
          if (err) {
            console.log(err);
            if (_.isRequest(req, res)) {
              res.status(500).json(self.FAILURE);
            } else {
              return false;
            }
          }
          self.is_logged_in_to_firebase = false;
          if (_.isRequest(req, res)) {
            if (_.isDefined(next)) {
              console.log("passing along")
              next(req, res)
            } else {
              res.status(200).json(self.SUCCESS);
            }
          } else {
            return true;
          }
        })
      });
    },
    get_sensor_data: (req, res) => {
      function eventHandler(data) {
        res.send(JSON.stringify(data))
        _.emitter.removeListener("newSensorData.noNotify", eventHandler);
      }
      _.emitter.emit("shouldReadSensors", {
        "noNotify": true
      })
      _.emitter.on("newSensorData.noNotify", eventHandler)
    },
    get_user_info: (req, res) => {
      var user = {
        "uid": firebase.auth().currentUser.uid,
        "displayName": firebase.auth().currentUser.displayName,
        "photoURL": firebase.auth().currentUser.photoURL,
        "email": firebase.auth().currentUser.email,
        "emailVerified": firebase.auth().currentUser.emailVerified,
        "phoneNumber": firebase.auth().currentUser.phoneNumber
      }
      if (_.isDefined(res)) {
        res.send(user);
      }
      return user;
    },
    test: (req, res) => {
      self.is_logged_in(req, res);
      // res.status(200).send("it worked");
    },
    get_device_info: (req, res) => {
      res.status(200).json(config.device);
    },
    make_restricted_area: (req, res, next) => {
      if (!firebase.auth().currentUser) {
        res.redirect('/');
      } else {
        return next();
      }
    },
    load_local_id_token: () => {
      var saved_token;
      storage_ready.then(() => {
        storage.getItem("id_token", (err, value) => {
          if (err) {
            console.log("there was an error retreivnig the id token")
            console.log(err);
            return -1;
          }
          if (value) {
            console.log("The id token was retreived from local storage")
            saved_token = value;
          }
        }).then(() => {
          self.update_auth_state(null, null, saved_token);
        })
      });
    },
    test_data_store: (req, res) => {
      var doc = {
        hello: 'world',
        n: 5,
        today: new Date(),
        nedbIsAwesome: true,
        notthere: null,
        notToBeSaved: undefined // Will not be saved
          ,
        fruits: ['apple', 'orange', 'pear'],
        infos: {
          name: 'nedb'
        }
      };

      db.insert(doc, function(err, newDoc) { // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefined
        db.persistence.compactDatafile()
        console.log(newDoc);
        console.log(config.device.datastorePath);
        res.send("added document");
      });

    },
    test_find_db: (req, res) => {
      res.send(db.find());
    },
    get_auth_credential: (req, res) => {
      res.send(JSON.stringify(self.current_auth_credential));
    },
    test_force_emit_delta: (req, res) => {
      var sp1 = {
        tstart: 1512428845269,
        timestamp: 1512428845269,
        sensors: [{
            value: 0.9557997558,
            name: 'Q1'
          },
          {
            value: 0.956043956,
            name: 'Q2'
          },
          {
            value: 0.9565323565,
            name: 'Q3'
          },
          {
            value: 0.9565323565,
            name: 'Q4'
          }
        ]
      };
      var sp2 = {
        tstart: 1512428845269,
        timestamp: 15124288,
        sensors: [{
            value: 0.5,
            name: 'Q1'
          },
          {
            value: 0.5,
            name: 'Q2'
          },
          {
            value: 0.5,
            name: 'Q3'
          },
          {
            value: 0.5,
            name: 'Q4'
          }
        ]
      }
      if (req.query.action) {
        if (req.query.action == "remove") {
          _.emitter.emit("newSensorData", sp2);
          _.emitter.emit("newSensorData", sp1);
        } else if (req.query.action == "add") {
          _.emitter.emit("newSensorData", sp1);
          _.emitter.emit("newSensorData", sp2);
        } else {
          res.status(400).json(self.FAILURE);
        }
      } else {
        _.emitter.emit("newSensorData", sp2);
        _.emitter.emit("newSensorData", sp1);
      }
      if (res) {
        res.json(self.SUCCESS);

      } else {
        return true;
      }

    },
    update_auth_state: (req, res, saved_token) => {
      console.log("running update auth")
      // console.log(saved_token);
      var id_token;
      if (req) {
        if (!(req.body.id_token === 'undefined')) {
          id_token = req.body.id_token
        } else {
          console.log("Unsuccesfull auth handshake")
          return res.status(400).json({
            ok: false
          });
          res.render('index.html', {
            title: "Dashboard",
            client_id: config.oauth.client_id
          });
        }
      } else {
        id_token = saved_token;
      }
      storage_ready.then(storage.setItem('id_token', id_token));
      // Build Firebase credential with the Google ID token.
      var credential = firebase.auth.GoogleAuthProvider.credential(id_token);
      // console.log(credential);
      // Sign in with credential from the Google user.
      firebase.auth().signInWithCredential(credential).catch(function(error) {
        console.log(error);
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

      });
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          self.current_auth_credential = credential;
          self.is_logged_in_to_firebase = true;
          console.log("Successfully signed into firebase")
          _.emitter.emit("FirebaseConnected")
          if (_.isDefined(res)) {
            res.json(self.SUCCESS);
          }
          // User is signed in.
          var info = {
            "displayName": user.displayName,
            "email": user.email,
            "emailVerified": user.emailVerified,
            "photoURL": user.photoURL,
            "uid": user.uid,
            "providerData": user.providerData
          }
          console.log(`got user login token: ${info.displayName} <${info.email}> [${info.uid}]`);
          // Register watchers on example senors and report to firebase
          fs.watch(config.device.sensorPath, (eventType, filename) => {
            console.log(eventType);
            if (eventType == "change" && filename) {
              fs.readFile(config.device.sensorPath + filename, "utf8", (err, data) => {
                if (err) throw err; 
                console.log(`Change detected: ${filename} ${data}`);

              });
            }
            if (eventType == "rename" && filename == config.device.sensorfilename) {
              console.log(`Critical Error: ${filename} removed!`);
              return
            }
            if (eventType == "rename" && filename != config.device.sensorfilename) {
              console.log(`Recoverable Error: ${filename} removed`);
            }
          });
        } else {
          self.is_logged_in_to_firebase = false;
          // User is signed out
        }
      });

    }
  }


_.emitter.on("FirebaseConnected", () => {
  fdb = firebase.database()
  // var sensorDataRef = fdb.ref(config.firebaserefs.debugDataPath)
  // sensorDataRef.once('value').then((data)=>{console.log(data.val())})
  fdb.ref(config.firebaserefs.debugShouldTakeMeasurementPath).on('value', (snapshot) => {
    console.log("API: firebase command point changed");
    var val = snapshot.val();
    if (!val) {
      console.log("API: -- command was false")
      return;
    }
    if (val == "debug") {
      console.log("API: running debug measurement")
      // Ideally shouldReadSensors will happen, then a delta will be sent up and watched by a function
      var w_ref = "users/lDKu7HgC8GQklFeJ21Fyim3jy2B3/devices/-KyOp-uCFCHGoRgkzALa/contents/-L-YZWKSuUrMsnIQJBOn" + "/weight"

      _.emitter.once("newSensorData", (data) => {
        console.log(data);
      });
      _.emitter.once("itemProbablyChanged", (data) => {
        fdb.ref(w_ref).set(data);
      });
      self.test_force_emit_delta({
        "query": {
          "action": "add"
        }
      });
    } else {
      // oh dip we're live here
      console.log("API: got command from firebase to update weight")
      console.log("API: -- waiting on sensors to change")
      var w_ref = val + "/weight";
      _.emitter.once("newSensorData", (data) => {
        console.log(data);
      });
      _.emitter.once("itemProbablyChanged", (data) => {
        var p1 = fdb.ref(w_ref).set(data);
        var p2 = fdb.ref(config.firebaserefs.debugShouldTakeMeasurementPath).set(false);
        Promise.all([p1, p2]).then(() => {
          console.log("API: sent deltas to firebase")
        })
      });
      _.emitter.emit("shouldReadSensors")
    }

  });
  _.emitter.on("newSensorData", self.handle_sensor_data);
  _.emitter.on("itemProbablyAdded", self.handle_item_probably_added);
  _.emitter.on("itemProbablyRemoved", self.handle_item_probably_removed);

})
