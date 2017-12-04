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
    SUCCESS: {
      "status": "ok"
    },
    FAILURE: {
      "status": "error"
    },
    handle_sensor_data: (data) => {
      if (!self.is_logged_in_to_firebase) return;

      console.log("API: got new sensor data " + data.timestamp);
      console.log(data);
      var sensorDataRef = fdb.ref(config.firebaserefs.debugDataPath + "/data")
      var newDataRef = sensorDataRef.push();
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
    logout: (req, res, next) => {
      storage_ready.then(() => {
        storage.removeItem("id_token", (err) => {
          firebase.auth().signOut().then(() => {
            console.log("User signed out")
          });
          if (err) {
            console.log(err);
            if (_.isRequest(req, res)) {
              console.log("there was an error AA")
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
  var sensorDataRef = fdb.ref(config.firebaserefs.debugDataPath)
  sensorDataRef.once('value').then((data)=>{console.log(data.val())})
  _.emitter.on("newSensorData", self.handle_sensor_data);
})
