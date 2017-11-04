// Initialize Firebase
firebase.initializeApp(config);
// console.log(`Initialized firebase app: ${app.name}`);
// var auth = app.auth();
// var provider = new firebase.auth.GoogleAuthProvider();
// var database = firebase.database();
// var user = {}
// var userURL;
//
// function writeUserData(userId, name, email, imageUrl) {
// 	firebase.database().ref('users/' + userId).set({
// 		username: name,
// 		email: email,
// 		profile_picture: imageUrl
// 	});
// }
// lDKu7HgC8GQklFeJ21Fyim3jy2B3
// firebase.auth().onAuthStateChanged(function(current_user) {
// 	if (current_user) {
// 		user = current_user;
// 		// User is signed in.
// 		console.log(`Successull login: ${user.displayName} <${user.email}> ID ${user.uid}`);
// 		console.log(user);
// 		current_user = user;
//     userURL = 'users/' + user.uid;
// 		$("#prof-pic").attr("src",user.photoURL);
// 		$("#prof-name").text(user.displayName);
// 		var dev0_ref = database.ref(`/users/${user.uid}/devices/0`);
// 		dev0_ref.on("value",(snapshot)=>{
// 			var data = snapshot.val();
// 			console.log("got: " + data);
// 			console.log(data);
// 			$("#device-rep").text(JSON.stringify(data));
// 		});
// 	}else{
// 		auth.signInWithRedirect(provider);
// 		firebase.auth().getRedirectResult().then(function(result) {
// 			if (result.credential) {
// 				// This gives you a Google Access Token. You can use it to access the Google API.
// 				var token = result.credential.accessToken;
// 				// user = result.user;
// 			}
// 			// The signed-in user info.
// 			// var user = result.user;
// 		}).catch(function(error) {
// 			// Handle Errors here.
// 			var errorCode = error.code;
// 			var errorMessage = error.message;
// 			// The email of the user's account used.
// 			var email = error.email;
// 			// The firebase.auth.AuthCredential type that was used.
// 			var credential = error.credential;
// 			console.error(`Login error with ${email} of type ${errorCode}`);
// 		});
// 	}
// });
// function toggleOpenState() {
// 	console.log("toggling shelf state");
// 	var ds_ref = database.ref(`/users/${user.uid}/devices/0/door-state`);
// 	ds_ref.once('value', (snapshot) => {
// 		var data = snapshot.val()
// 		console.log(data);
// 		if (data == "closed") {
// 			ds_ref.set("open");
// 		} else if (data == "open") {
// 			ds_ref.set("closed");
// 		} else {
// 			console.log("unkown transition state");
// 		}
// 		// if(data.)
// 	})
// }


// Angular stuff
// Define the `phonecatApp` module
var iotApp = angular.module('iotApp', ["firebase"]);

iotApp.service('deviceService', function() {
	var deviceList = [];
	var addDevice = function(newDevice) {
		deviceList.push(newDevice);
	}
	var getDevices = function() {
		return deviceList;
	}
	return {
		addDevice: addDevice,
		getDevices: getDevices
	}
});

// iotApp.factory('userDevices', function($firebaseArray) {
// 	var ref = firebase.database().ref(userURL + '/deviceNames');
// 	console.log("user url is::: ");
// 	console.log(userURL);
//
// 	var fa = $firebaseArray(ref);
// 	return fa;
// })

iotApp.controller('iotCtrl', function iotCtrl($scope, $firebaseObject, $firebaseAuth, $firebaseArray, deviceService) {
	$scope.mywords = "hello world";
	// $scope.devices = deviceService.getDevices();
	$scope.devices = ["wop", "wop2"];
	$scope.user = null;
	$scope.ref = null;
	$scope.obj = null;
	$scope.auth = $firebaseAuth();
	// $scope.currentdevice = ["thing1", "thing2"];
	if (!$scope.devices[0]) {
		$scope.selected = "no devices :(";
	} else {
		$scope.selected = $scope.devices[0];
	}

	$scope.setActiveDevice = function(device) {
		$scope.selected = device;
		console.log($scope.currentdevice);
	}
	$scope.toggleOpenState = function(){

	}

	// $scope.currentdevice = null;
	$scope.login = function() {
		if ($scope.user == null) {
			console.log("attempting login");
			var provider = new firebase.auth.GoogleAuthProvider();
			$scope.auth.$signInWithPopup(provider).then(function(response) {
				console.log("Signed in as:", response.user.uid);
				$scope.user = response.user;
				console.log($scope.user);

			}).catch(function(error) {
				console.log("Authentication failed:", error);
			});
		}

	}
	$scope.logout = function() {
		if ($scope.user) {
			$scope.auth.$signOut();
			$scope.user = null;
			alert("");
		}
	}
	$scope.auth.$onAuthStateChanged(function(firebaseUser) {
		if (firebaseUser) {
			console.log("Signed in as:", firebaseUser.uid);
			$scope.user = firebaseUser;
			console.log(firebaseUser);
			// $scope.currentdevice = firebase.database().ref('/users/' + $scope.user.uid +  '/deviceNames');
			var ref = firebase.database().ref(`users/${$scope.user.uid}/`);
			var obj = $firebaseObject(ref);
			obj.$loaded().then(function() {
				console.log("loaded record:", obj.$id, obj.username);

				// To iterate the key/value pairs of the object, use angular.forEach()
				angular.forEach(obj, function(value, key) {
					console.log(key, value);
				});
        $scope.currentdevice = obj.devices[0];
				$scope.selected = $scope.currentdevice.name;
				$scope.devices = obj.devices;
			});

		} else {
			console.log("Signed out");
		}
	});



});

iotApp.controller('modalCtrl', function modalCtrl($scope, deviceService) {
	$scope.devicename = "new device";
	$scope.submitdevice = function() {
		console.log($scope.devicename);
		// deviceService.addDevice($scope.devicename);

	}
});
