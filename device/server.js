var firebase = require("firebase");
var config = require("./config/config.js");
firebase.initializeApp(config.firebase);
// console.log(firebase);
const express = require('express')
const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')
const fs = require('fs');

const app = express()
nunjucks.configure('views', {
  autoescape: true,
  express: app
})
// app.use(bodyParser.json())
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index.html', {
    title: "Smart Shelf",
    client_id: config.oauth.client_id
  });
})

app.post('/api/update-auth-state', (req, res) => {
  // console.log(req.body.id_token);
  if (!(req.body.id_token === 'undefined')) {
    console.log("--> ID Token is defined.")
    res.status(200).json({
      ok: true
    });
  } else {
    console.log("--> ID Token is NOT defined.")
    return res.status(400).json({
      ok: false
    });
  }
  console.log("got here")

  var id_token = req.body.id_token;
  // Build Firebase credential with the Google ID token.
  var credential = firebase.auth.GoogleAuthProvider.credential(id_token);

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
      // User is signed in.
      var info = {
        "displayName": user.displayName,
        "email": user.email,
        "emailVerified": user.emailVerified,
        "photoURL": user.photoURL,
        "uid": user.uid,
        "providerData": user.providerData
      }
      console.log(info);
      // Register watchers on example senors and report to firebase
      fs.watch (config.device.sensorPath, (eventType, filename) => {
        if (filename) {
          console.log(filename);
          fs.readFile(config.device.sensorPath + filename,"utf8",(err, data) => {
            if (err) throw err;
            console.log(data);
          });
          // Prints: <Buffer ...>
        }
      });




    } else {
      // User is signed out
    }
  });


});

app.get('/api/get-firebase-config', (req, res) => {
  //TODO: This is pretty dirty maybe dont do this
  // avoids having to have yet ANOTHER config file
  res.status(200).send("var config = " + JSON.stringify(config.firebase));
})
app.get('/api/get-device-info', (req, res) => {
  res.status(200).json(config.device);
})
app.listen(3000, () => console.log('Server listening on port 3000...'))
