// Initialize Firebase
firebase.initializeApp(config);

var iotApp = angular.module('iotApp', ["firebase", "pickadate"]);

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
  $scope.devices = [];
  $scope.user = null;
  $scope.ref = null;
  $scope.obj = null;
  $scope.itemsRef = null;
  $scope.newitem = null;
  $scope.mindate = "2017-11-11";
  $scope.newdevicename = "new device";
  $scope.auth = $firebaseAuth();
  // $scope.currentdevice = ["thing1", "thing2"];
  if (!$scope.devices[0]) {
    $scope.selected = "no devices :(";
  } else {
    $scope.selected = $scope.devices[0];
  }

  $scope.setActiveDevice = function(device) {
    console.log("User selected:");
    console.log(device);
    $scope.currentdevice = device;
    console.log($scope.currentdevice);
    $scope.itemsRef = firebase.database().ref(`users/${$scope.user.uid}/devices/${$scope.currentdevice.$id}/contents/`);
    $scope.itemsArr = $firebaseArray($scope.itemsRef);
  }
  $scope.toggleDoorState = function() {
    console.log("Toggling open state of:");
    console.log($scope.currentdevice);
    if ($scope.currentdevice["door-state"] == "open") {
      $scope.currentdevice["door-state"] = "closed";
    } else {
      $scope.currentdevice["door-state"] = "open";
    }
    firebase.database().ref(`users/${$scope.user.uid}/devices/${$scope.currentdevice.$id}/door-state/`).set(
      $scope.currentdevice["door-state"]
    )

  }
  $scope.runFirstTimeSetup = function() {
    console.log("Running First Time Setup");
    console.log($scope.user);
    firebase.database().ref('users/' + $scope.user.uid).set({
      username: $scope.user.displayName,
      email: $scope.user.email,
      profile_picture: $scope.user.photoURL
    });
    // firebase.database().ref('users/' + $scope.user.uid + "/devices/").set({
    // 	"door-state": "closed",
    // 	"name":"Fridge"
    // });
    $scope.submitdevice(prompt("What Should we call your first device?"));
    $scope.initScope();
  }
  $scope.initScope = function() {
    var ref = firebase.database().ref(`users/${$scope.user.uid}/`);
    var obj = $firebaseObject(ref);
    obj.$loaded(function() {
      // $scope.currentdevice = $firebaseObject(firebase.database().ref(`users/${$scope.user.uid}/devices/0`));
      // $scope.selected = $scope.currentdevice.name;
      $scope.devicesRef = firebase.database().ref(`users/${$scope.user.uid}/devices/`);
      $scope.devicesArr = $firebaseArray($scope.devicesRef);
      $scope.devicesArr.$loaded(function() {
        $scope.currentdevice = $scope.devicesArr[0];
        $scope.itemsRef = firebase.database().ref(`users/${$scope.user.uid}/devices/${$scope.currentdevice.$id}/contents`);
        $scope.itemsArr = $firebaseArray($scope.itemsRef);
      })
    })
  }
  $scope.deleteDevice = function(device) {

  }
  $scope.editDevice = function(device) {

  }
  $scope.addStoredItem = function(item) {
    console.log("running addStoredItem");
    // var ref = firebase.database().ref(`users/${$scope.user.uid}/devices/0/contents`);
    var newRef = $scope.itemsRef.push();
    var objToAdd = {
      "name": $scope.newitem.name,
      "amount": $scope.newitem.amount,
      "expiry": $scope.newitem.expiry
    }
    // $scope.currentdevice.contents.push(objToAdd);
    console.log(objToAdd);
    newRef.set(objToAdd).then((data) => {
      console.log("added a thing probbably")
    });
    // console.log(list);
  }
  $scope.submitdevice = function(devicename) {
    if (!devicename) {
      devicename = $scope.newdevicename;
    }
    console.log("adding new device : " + devicename);
    var newRef = $scope.devicesRef.push();
    var objToAdd = {
      "name": devicename
    }
    newRef.set(objToAdd).then((data) => {
      console.log("added a new device probbably")
    });

  }
  $scope.toggleEnrollModal = function() {

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
    }
  }
  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if (firebaseUser) {
      $scope.user = firebaseUser;
      $scope.initScope();

    } else {
      console.log("Signed out");
    }
  });
});
