var inria = new LatLon(50.604855, 3.149164);
var secretariat = new LatLon(50.605638, 3.148236);
var m5 = new LatLon(50.609593, 3.136724);


var compass = {};
compass.data = {};
compass.data.position = {};
compass.data.actualPosition = {};
compass.data.heading = {};

compass.data.destination = {};


compass.onSuccessLocation = function onSuccessLocation(_position) {
    compass.data.position = _position;

    //document.getElementById("latitude").innerHTML = compass.data.position.coords.latitude;
    //document.getElementById("longitude").innerHTML = compass.data.position.coords.longitude;
    //document.getElementById("accuracy").innerHTML = compass.data.position.coords.accuracy;

    $('#compass .precision .valeur span').text(Math.round(compass.data.position.coords.accuracy));
    
    actualPosition = new LatLon(compass.data.position.coords.latitude, compass.data.position.coords.longitude);
    $('#compass .distance .valeur span').text(Math.round(actualPosition.distanceTo(compass.data.destination)*1000));
    //document.getElementById("bearingto").innerHTML = actualPosition.bearingTo(m5);

}
compass.onErrorLocation = function onErrorLocation(error){
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}





compass.onSuccessOrientation = function onSuccessOrientation(_heading) {
    compass.data.heading = _heading;
    //document.getElementById("heading").innerHTML = Math.round(compass.data.heading.magneticHeading*100)/100;

    var angle = actualPosition.bearingTo(m5) - compass.data.heading.magneticHeading
    //document.getElementById("angle").innerHTML = angle;
    app.rotate(Math.round(angle));
}
compass.onErrorOrientation = function onErrorOrientation(error){
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}


compass.activateLocation = function activateLocation(){
    if(navigator.geolocation){
      // timeout at 60000 milliseconds (60 seconds)
      var options = {maximumAge: 1000, timeout:60000, enableHighAccuracy: true};
      navigator.geolocation.watchPosition(compass.onSuccessLocation, 
                                               compass.onErrorLocation,
                                               options);
   }else{
      alert("Sorry, browser does not support geolocation!");
   }
};

compass.activateOrientation = function activateOrientation(){
    if(navigator.compass){
      var options = {
        frequency: 500
      }; // Update every 3 seconds
      navigator.compass.watchHeading(compass.onSuccessOrientation, 
                                               compass.onErrorOrientation, options);
   }else{
      alert("Sorry, browser does not support orientation!");
   }
};