// Initialize Firebase
var app = firebase.initializeApp(config);
console.log(`Initialized firebase app: ${app.name}`);
var auth = app.auth();
var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();
var user = {}
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}
// lDKu7HgC8GQklFeJ21Fyim3jy2B3
firebase.auth().onAuthStateChanged(function(current_user) {
	if (current_user) {
		user = current_user;
		// User is signed in.
		console.log(`Successull login: ${user.displayName} <${user.email}> ID ${user.uid}`);
		console.log(user);
		current_user = user;
		$("#prof-pic").attr("src",user.photoURL);
		$("#prof-name").text(user.displayName);
		var dev0_ref = database.ref(`/users/${user.uid}/devices/0`);
		dev0_ref.on("value",(snapshot)=>{
			var data = snapshot.val();
			console.log("got: " + data);
			console.log(data);
			$("#device-rep").text(JSON.stringify(data));
		});
	}else{
		auth.signInWithRedirect(provider);
		firebase.auth().getRedirectResult().then(function(result) {
			if (result.credential) {
				// This gives you a Google Access Token. You can use it to access the Google API.
				var token = result.credential.accessToken;
				// user = result.user;
			}
			// The signed-in user info.
			// var user = result.user;
		}).catch(function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// The email of the user's account used.
			var email = error.email;
			// The firebase.auth.AuthCredential type that was used.
			var credential = error.credential;
			console.error(`Login error with ${email} of type ${errorCode}`);
		});
	}
});
function toggleOpenState(){
	console.log("toggling shelf state");
	var ds_ref = database.ref(`/users/${user.uid}/devices/0/door-state`);
	ds_ref.once('value',(snapshot)=>{
		var data = snapshot.val()
		console.log(data);
		if(data == "closed"){
			ds_ref.set("open");
		}else if(data == "open"){
			ds_ref.set("closed");
		}else{
			console.log("unkown transition state");
		}
		// if(data.)
	})
}
