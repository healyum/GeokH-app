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

// window.plugins.insomnia.keepAwake(function() {console.log('Insomnia up')}, function() {console.log('Insomnia error')});
/* TODO
function onConfirmStorage(button) {
// Si 'Continuer' sur la sauvegarde
if (button == 1)
    loadLocalStorage();
// Sinon 'Recommencer'
else if (button == 2)
    window.localStorage.clear();
}

function loadLocalStorage() {
app.score = parseFloat(window.localStorage.getItem('score'));
app.equipe = String(window.localStorage.getItem('equipe'));
app.niveau = parseInt(window.localStorage.getItem('level'));
app.parcours = parseInt(window.localStorage.getItem('numParcours'));
var tabOrdre = String(window.localStorage.getItem('infosParcours'));
app.parcoursOrdre = tabOrdre.split(',');
app.infos = jQuery.parseJSON(window.localStorage.getItem('infosParcours'));
app.entrepreneurs = jQuery.parseJSON(window.localStorage.getItem('entrepreneurs'));
app.baliseCourante = parseInt(window.localStorage.getItem('currentMark'));
app.questionCourante = parseInt(window.localStorage.getItem('currentQuestion'));
app.entrepreneurSelect = String(window.localStorage.getItem('entrepreneurSelect'));
app.entrepreneurATrouver = String(window.localStorage.getItem('entrepreneurToFind'));
app.nbBalisesTrouvees = parseInt(window.localStorage.getItem('nbMarksFind'));
app.nbReponsesTrouvees = parseInt(window.localStorage.getItem('nbAnswers'));
app.isTimerLoaded = Boolean(window.localStorage.getItem('isTimerLoaded'));
app.isTimerLoaded = false;
startTimer();

var tab = String(window.localStorage.getItem('goodAnswerUser'));
app.bonnesReponsesUser = (!tab.trim()) ? [] : tab.split(',');
app.currentTime = parseInt(window.localStorage.getItem('currentTime'));
var d = new Date();
var now = d.getTime();
var local = parseInt(window.localStorage.getItem('localTime'));
var diff = Math.ceil(Math.abs(now - local));

app.currentTime = parseInt(diff) + app.currentTime;
app.currentTime = parseInt(app.currentTime);

app.nbPointsCorrect = parseInt(window.localStorage.getItem('nbPointsCorrect'));

var backupView = app.actualView;
app.actualView = String(window.localStorage.getItem('actualView'));
if (app.actualView != backupView)
    app.showView(app.actualView);
}

function saveLocalStorage() {
window.localStorage.setItem('score', String(app.score));
window.localStorage.setItem('equipe', String(app.equipe));
window.localStorage.setItem('niveau', String(app.niveau));
window.localStorage.setItem('parcours', String(app.parcours));
window.localStorage.setItem('parcoursOrdre', String(app.parcoursOrdre));
window.localStorage.setItem('infos', JSON.stringify(app.infos));
window.localStorage.setItem('entrepreneurs', JSON.stringify(app.entrepreneurs));
window.localStorage.setItem('baliseCourante', String(app.baliseCourante));
window.localStorage.setItem('questionCourante', String(app.questionCourante));
window.localStorage.setItem('entrepreneurSelect', String(app.entrepreneurSelect));
window.localStorage.setItem('entrepreneurATrouver', String(app.entrepreneurATrouver));
window.localStorage.setItem('nbBalisesTrouvees', String(app.nbBalisesTrouvees));
window.localStorage.setItem('nbReponsesTrouvees', String(app.nbReponsesTrouvees));
window.localStorage.setItem('isTimerLoaded', String(app.isTimerLoaded));
window.localStorage.setItem('bonnesReponsesUser', String(app.bonnesReponsesUser));
window.localStorage.setItem('currentTime', String(app.currentTime));
var d = new Date();
var n = d.getTime();
window.localStorage.setItem('localTime', String(n));
window.localStorage.setItem('nbPointsCorrect', String(app.nbPointsCorrect));
window.localStorage.setItem('actualView', String(app.actualView));
window.localStorage.setItem('isInit', 'true');
}
*/