var inria = new LatLon(50.604855, 3.149164);
var secretariat = new LatLon(50.605638, 3.148236);
var m5 = new LatLon(50.609593, 3.136724);


var compass = {};
compass.data = {};
compass.data.position = {};
compass.data.actualPosition = {};
compass.data.heading = {};

compass.data.destination = {};
var idWatchLoc = 0;
var idWatchOrient = 0;

compass.onSuccessLocation = function onSuccessLocation(_position) {
    compass.data.position = _position;

    app.updatePrecision(Math.round(compass.data.position.coords.accuracy));

    actualPosition = new LatLon(compass.data.position.coords.latitude, compass.data.position.coords.longitude);
    app.updateDistance(Math.round(actualPosition.distanceTo(compass.data.destination) * 1000));

}
compass.onErrorLocation = function onErrorLocation(error) {
    alert('Error Location : \n' +
    'code: ' + error.code + '\n' +
    'message: ' + error.message + '\n');
}


compass.onSuccessOrientation = function onSuccessOrientation(_heading) {
    compass.data.heading = _heading;
    var angle = actualPosition.bearingTo(m5) - compass.data.heading.magneticHeading
    app.rotate(Math.round(angle));
    //alert('Orient ok');
};
compass.onErrorOrientation = function onErrorOrientation(error) {
    alert('Error orientation : \n' +
    'code: ' + error.code + '\n' +
    'message: ' + error.message + '\n');
};

compass.stopLocation = function stopLocation() {
    navigator.geolocation.clearWatch(idWatchLoc);
};


compass.activateLocation = function activateLocation() {
    if (navigator.geolocation) {

        var options = {maximumAge: 0, timeout: 1500, enableHighAccuracy: true};
        idWatchLoc = navigator.geolocation.watchPosition(compass.onSuccessLocation,
            compass.onErrorLocation,
            options);
    } else {
        alert("Geolocation not available!");
    }
};

compass.stopOrientation = function stopOrientation() {
    navigator.compass.clearWatch(idWatchOrient);
};

compass.activateOrientation = function activateOrientation() {
    if (navigator.compass) {
        var options = {
            frequency: 1500
        }; // Update every 1.5 seconds
        idWatchOrient = navigator.compass.watchHeading(compass.onSuccessOrientation,
            compass.onErrorOrientation, options);
    } else {
        alert("Orientation not available!");
    }
};