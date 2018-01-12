function checkConnection() {
    if (!navigator.network)
        navigator.network = window.top.navigator.network;

    return ((navigator.network.connection.type === "none" || navigator.network.connection.type === null || navigator.network.connection.type === "unknown" ) ? false : true );
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function pad(number, length) {
    var str = '' + number;

    while (str.length < length)
        str = '0' + str;

    return str;
}

function formatTime(time) {
    time = time / 10;

    var hours = parseInt(time / (60 * 60 * 100));
    var min = parseInt(time / (60 * 100)) - (hours * 60);
    var sec = parseInt(time / 100) - (min * 60) - (hours * 60 * 60);

    return (hours > 0 ? pad(hours, 2) : "00") + ":" + (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2);
}

function stopwatch() {
    $.timer.isActive = false;
}

function startTimer() {
    var $stopwatch;

    // Timer speed in milliseconds
    var incrementTime = 70;

    var uptdateTimer = function updateTimer() {
        var timeString = formatTime(app.currentTime);
        $stopwatch.html(timeString);
        app.currentTime += incrementTime;
    };

    // Start the timer
    if (!this.isTimerLoaded) {
        app.currentTime = 0;
        this.isTimerLoaded = true;
        $stopwatch = $('#timer');
        $.timer(uptdateTimer, incrementTime, true);
    }
}

// Rotate compass
function rotate(angle) {
    $('#compass_elt').rotate(angle);
}

// Mise à jour de la distance
function updateDistance(distance) {
    var compass = document.getElementById('compass');
    var conseil = compass.getElementsByClassName('conseil')[0];
    var valeur = conseil.getElementsByClassName('valeur')[0];

    var conseilHide = document.getElementById('conseilHide');

    // Affiche ou non l'indice si < 50 mètres
    if (distance < 50) {
        valeur.style['display'] = 'block';
        conseilHide.style['display'] = 'none';
    }
    else {
        valeur.style['display'] = 'none';
        conseilHide.style['display'] = 'block';
    }

    // Met à jour la distance dans l'affichage
    var dist = compass.getElementsByClassName('distance')[0];
    var valeur = dist.getElementsByClassName('valeur')[0];

    valeur.textContent = distance;
}

// Mise à jour de la precision
function updatePrecision(accuracy) {

    var compass = document.getElementById('compass');
    var precision = compass.getElementsByClassName('precision')[0];
    var valeur = precision.getElementsByClassName('valeur')[0];

    // Met à jour la précision dans l'affichage
    valeur.textContent = accuracy;
}

function onConfirmPassMark(button) {
    // Si confirmation de passer la balise
    if (button == 1) {
        app.currentMark++;
        app.score -= 150;

        navigator.notification.confirm('Vous avez passé la ' + app.currentMark + '' + ((app.currentMark == 1) ? 'ere' : 'eme') + ' balise et perdu 150 points !', null, 'Balise passée', ['Ok']);

        app.showView('#compass');
    }
}

function onBackKeyDown() {
    navigator.notification.confirm('Êtes-vous certains de vouloir quitter l\'application ?', onConfirmQuit, 'Confirmation', ['Rester', 'Quitter']);
}

function onConfirmQuit(button) {
    // Si le bouton 'Quitter'
    if (button == 2)
        exitFromApp();
}

function exitFromApp() {
    compass.stopLocation();
    compass.stopOrientation();
    navigator.app.exitApp();
}