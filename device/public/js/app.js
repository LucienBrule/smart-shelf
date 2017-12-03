var auth = null;
firebase.initializeApp(config);
firebase.auth().onAuthStateChanged(function(firebaseUser) {
  if (firebaseUser) {
    console.log(JSON.stringify(firebaseUser))
    // $.ajax({
    //   type: "POST",
    //   url: "/api/update-auth-state",
    //   data: JSON.stringify(firebaseUser),
    //   contentType:"application/json",
    //   dataType: "json"
    //
    // })
    auth = firebaseUser;


  } else {
    console.log("Signed out");
  }
});

function isUserEqual(googleUser, firebaseUser) {
  if (firebaseUser) {
    var providerData = firebaseUser.providerData;
    for (var i = 0; i < providerData.length; i++) {
      if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
        providerData[i].uid === googleUser.getBasicProfile().getId()) {
        // We don't need to reauth the Firebase connection.
        return true;
      }
    }
  }
  return false;
}

function onSignIn(googleUser) {


  console.log('Google Auth Response', googleUser);
  // We need to register an Observer on Firebase Auth to make sure auth is initialized.
  var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
    unsubscribe();
    // Check if we are already signed-in Firebase with the correct user.
    if (!isUserEqual(googleUser, firebaseUser)) {
      // Build Firebase credential with the Google ID token.
      var credential = firebase.auth.GoogleAuthProvider.credential(
        googleUser.getAuthResponse().id_token);
      // Sign in with credential from the Google user.
      firebase.auth().signInWithCredential(credential).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log("----> we're gucci");
      });
    } else {
      console.log('User already signed-in Firebase.');
    }
  });


  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

  var id_token = googleUser.getAuthResponse().id_token
  console.log('ID Token:', id_token);
  console.log("we're about to make the post request.")
  $.ajax({
    type: "POST",
    url: "/api/update-auth-state",
    data: JSON.stringify({
      "id_token": id_token
    }),
    contentType: "application/json",
    dataType: "json",
    success: (data) => {
      console.log("POST SUCESS");
      console.log(data);
      setTimeout(()=>{
        window.location="/dashboard";
      },10)
    },
    error: (data) => {
      console.log("POST FAILED");
      console.log(error)
    }
  })
}

function doAuthExchange() {
  console.log("starting auth exchange");
  if (user == null) {
    console.log("attempting login");
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(response) {
      console.log("Signed in as:", response.user.uid);
      user = response.user;
      console.log(user);

    }).catch(function(error) {
      console.log("Authentication failed:", error);
    });
  }
}
