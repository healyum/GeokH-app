var compass = {
    data: {
        lastPosition: null,
        actualPosition: null
    },

    idWatchLocation: 0,
    idWatchOrientation: 0,

    countErrorsLocation: 0,
    countErrorsOrientation: 0,

    updateTimer: 750,

    progressBar: new ProgressBar(),
    
    hasMagneticSensor: true,

    onSuccessLocation: function(position) {
        app.updatePrecision(Math.round(position.coords.accuracy));

        compass.data.lastPosition = compass.data.actualPosition;

        compass.data.actualPosition = new LatLon(position.coords.latitude, position.coords.longitude);
        var distance = Math.round(compass.data.actualPosition.distanceTo(compass.data.destination) * 1000);

        if (!compass.progressBar.isInitialized)
            compass.progressBar.initialize(distance, compass.data.destination);

        if (compass.data.destination != compass.progressBar.destination)
            compass.progressBar.initialize(distance, compass.data.destination);

        if (!compass.hasMagneticSensor)
            compass.updateDirectionWithGPS();

        app.updateDistance(distance);
    },

    onErrorLocation: function() {
        compass.countErrorsLocation++;

        if (compass.countErrorsLocation == 3)
            navigator.notification.alert('Localisation non disponible', function () {
            }, 'Erreur', 'Ok');
    },

    onSuccessOrientation: function(heading) {
        compass.data.heading = heading;

        var angle = compass.data.actualPosition.bearingTo(compass.data.destination) - compass.data.heading.magneticHeading;
        app.rotate(Math.round(angle));
    },

    onErrorOrientation: function() {
        compass.countErrorsOrientation++;

        compass.hasMagneticSensor = false;

        if (compass.countErrorsOrientation == 3) {
            navigator.notification.alert('Orientation non disponible', function () {
            }, 'Erreur', 'Ok');
        }
    },

    activateLocation: function() {
        if (navigator.geolocation) {
            var options = {maximumAge: 0, timeout: compass.updateTimer, enableHighAccuracy: true};
            compass.idWatchLocation = navigator.geolocation.watchPosition(compass.onSuccessLocation, compass.onErrorLocation, options);
        } else {
            navigator.notification.alert('Localisation non disponible', function () {
            }, 'Erreur', 'Ok');
        }
    },

    stopLocation: function() {
        navigator.geolocation.clearWatch(compass.idWatchLocation);
        compass.countErrorsLocation = 0;
    },

    activateOrientation: function() {
        if (navigator.compass) {
            var options = {
                frequency: compass.updateTimer
            }; // Update every .5 seconds
            compass.idWatchOrientation = navigator.compass.watchHeading(compass.onSuccessOrientation, compass.onErrorOrientation, options);
        } else {
            navigator.notification.alert('Orientation non disponible', function () {
            }, 'Erreur', 'Ok');
        }
    },

    stopOrientation: function() {
        navigator.compass.clearWatch(compass.idWatchOrientation);
        compass.countErrorsOrientation = 0;
    },

    stopOrientation: function() {
        navigator.compass.clearWatch(compass.idWatchOrientation);
        compass.countErrorsOrientation = 0;
    },

    updateDirectionWithGPS: function() {
        if (compass.data.lastPosition == null)
            return;

        var φa = compass.data.actualPosition.lat.toRadians(), λa = compass.data.actualPosition.lon.toRadians();
        var φb = compass.data.lastPosition.lat.toRadians(), λb = compass.data.lastPosition.lon.toRadians();
        var φc = compass.data.destination.lat.toRadians(), λc = compass.data.destination.lon.toRadians();

        var ΔEba = φa - φb;
        var ΔEbc = φc - φb;
        var ΔNba = λa - λb;
        var ΔNbc = λc - λb;

        var α = Math.atan(ΔEbc/ΔNbc) - Math.atan(ΔEba/ΔNba);

        if (!isNaN(α))
            app.rotate(180 * α / Math.PI);
    }
}
