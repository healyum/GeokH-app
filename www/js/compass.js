var compass = {
    data: {
        position: {},
        actualPosition: {},
        heading: {},
        destination: {},
    },
};

var idWatchLoc = 0;
var idWatchOrient = 0;
var updateTimer = 750;

var countErrorsLoc = 0;
var countErrorsOr = 0;

compass.onSuccessLocation = function onSuccessLocation(position) {
    compass.data.position = position;

    app.updatePrecision(Math.round(compass.data.position.coords.accuracy));

    var actualPosition = new LatLon(compass.data.position.coords.latitude, compass.data.position.coords.longitude);
    app.updateDistance(Math.round(actualPosition.distanceTo(compass.data.destination) * 1000));
}

// variable error can be add at function parameter
compass.onErrorLocation = function onErrorLocation() {
    countErrorsLoc++;

    if (countErrorsLoc == 3)
        navigator.notification.alert('Localisation non disponible', function () {
        }, 'Erreur', 'Ok');
}

compass.onSuccessOrientation = function onSuccessOrientation(heading) {
    compass.data.heading = heading;

    var angle = compass.data.actualPosition.bearingTo(compass.data.destination) - compass.data.heading.magneticHeading;
    app.rotate(Math.round(angle));
};

// variable error can be add at function parameter
compass.onErrorOrientation = function onErrorOrientation() {
    countErrorsOr++;

    if (countErrorsOr == 3)
        navigator.notification.alert('Orientation non disponible', function () {
        }, 'Erreur', 'Ok');
};

compass.activateLocation = function activateLocation() {
    if (navigator.geolocation) {
        var options = {maximumAge: 0, timeout: updateTimer, enableHighAccuracy: true};
        idWatchLoc = navigator.geolocation.watchPosition(compass.onSuccessLocation, compass.onErrorLocation, options);
    } else {
        navigator.notification.alert('Localisation non disponible', function () {
        }, 'Erreur', 'Ok');
    }
};

compass.stopLocation = function stopLocation() {
    navigator.geolocation.clearWatch(idWatchLoc);
    countErrorsLoc = 0;
};

compass.activateOrientation = function activateOrientation() {
    if (navigator.compass) {
        var options = {
            frequency: updateTimer
        }; // Update every .5 seconds
        idWatchOrient = navigator.compass.watchHeading(compass.onSuccessOrientation, compass.onErrorOrientation, options);
    } else {
        navigator.notification.alert('Orientation non disponible', function () {
        }, 'Erreur', 'Ok');
    }
};

compass.stopOrientation = function stopOrientation() {
    navigator.compass.clearWatch(idWatchOrient);
    countErrorsOr = 0;
};