var compass = {
    data: {
        lastPosition: null,
        actualPosition: null,
    },

    idWatchLocation: 0,
    idWatchOrientation: 0,

    countErrorsLocation: 0,
    countErrorsOrientation: 0,

    updateTimer: 500,

    //progressBar: new ProgressBar(),
    
    hasMagneticSensor: true,

    onSuccessLocation: function(position) {
        updatePrecision(Math.round(position.coords.accuracy));

        compass.data.lastPosition = compass.data.actualPosition;

        compass.data.actualPosition = new LatLon(position.coords.latitude, position.coords.longitude);
        var distance = Math.round(compass.data.destination.distanceTo(compass.data.actualPosition));

        updateDistance(distance);

        /*
        if (!compass.progressBar.isInitialized)
            compass.progressBar.initialize(distance, compass.data.destination);

        if (compass.data.destination != compass.progressBar.destination)
            compass.progressBar.initialize(distance, compass.data.destination);
        */
    },

    activateLocation: function() {
        if (navigator.geolocation) {
            var options = {maximumAge: 0, timeout: compass.updateTimer, enableHighAccuracy: true};
            compass.idWatchLocation = navigator.geolocation.watchPosition(compass.onSuccessLocation, null, options);
        }
    },

    stopLocation: function() {
        navigator.geolocation.clearWatch(compass.idWatchLocation);
        compass.countErrorsLocation = 0;
    },

    onSuccessOrientation: function(heading) {
        compass.data.heading = heading;

        if (compass.data.actualPosition != null) {
            var angle = compass.data.actualPosition.bearingTo(compass.data.destination) - compass.data.heading.magneticHeading;
            rotate(Math.round(angle));
        }
    },

    activateOrientation: function() {
        if (navigator.compass) {
            var options = {
                frequency: compass.updateTimer
            }; // Update every .5 seconds
            compass.idWatchOrientation = navigator.compass.watchHeading(compass.onSuccessOrientation, null, options);
        }
    },

    stopOrientation: function() {
        navigator.compass.clearWatch(compass.idWatchOrientation);
        compass.countErrorsOrientation = 0;
    },
}
