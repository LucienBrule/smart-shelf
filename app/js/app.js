// Initialize Firebase
firebase.initializeApp(config);

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



iotApp.controller('iotCtrl', function iotCtrl($scope, $firebaseObject, $firebaseAuth, $firebaseArray, deviceService) {
	$scope.mywords = "hello world";
	// $scope.devices = deviceService.getDevices();
	$scope.devices = ["wop", "wop2"];
	$scope.user = null;
	$scope.ref = null;
	$scope.obj = null;
	$scope.itemsRef = null;
	$scope.newdevicename = "new device";
	$scope.auth = $firebaseAuth();
	// $scope.currentdevice = ["thing1", "thing2"];
	if (!$scope.devices[0]) {
		$scope.selected = "no devices :(";
	} else {
		$scope.selected = $scope.devices[0];
	}

	$scope.setActiveDevice = function(device) {
		$scope.selected = device;
		console.log("current device is: ");
		console.log($scope.currentdevice);
	}
	$scope.toggleOpenState = function(){

	}
	$scope.addStoredItem = function(item){
		console.log("running addStoredItem");
		// var ref = firebase.database().ref(`users/${$scope.user.uid}/devices/0/contents`);
		var newRef = $scope.itemsRef.push();
		var val = prompt("Enter an item to add");
		var num = prompt("How many, " + val + " ?");
		console.log("gonna add this item: " + val);
		var objToAdd = {"name":val,"amount":num}
		newRef.set(objToAdd).then((data)=>{console.log("added a thing probbably")});
		// console.log(list);
	}
	$scope.submitdevice = function(){
		console.log("adding new device : " + $scope.newdevicename);
		var newRef = $scope.devicesRef.push();
		var objToAdd = {"name":$scope.newdevicename}
		newRef.set(objToAdd).then((data)=>{console.log("added a new device probbably")});

	}
	$scope.toggleEnrollModal = function(){

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
				$scope.devicesRef = firebase.database().ref(`users/${$scope.user.uid}/devices/`);
				$scope.devicesArr = $firebaseArray($scope.devicesRef);
				$scope.itemsRef =  firebase.database().ref(`users/${$scope.user.uid}/devices/0/contents`);
				$scope.itemsArr = $firebaseArray($scope.itemsRef);


			});

		} else {
			console.log("Signed out");
		}
	});



});
