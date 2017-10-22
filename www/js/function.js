function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Common functions
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function formatTime(time) {
    time = time / 10;

    var hours = parseInt(time / (60 * 60 * 100)),
        min = parseInt(time / (60 * 100)) - (hours * 60),
        sec = parseInt(time / 100) - (min * 60) - (hours * 60 * 60),
        hundredths = Math.ceil(pad(time - (sec * 100) - (min * 6000) - (hours * 60 * 6000), 2));
    hundredths = (hundredths < 10 || hundredths == 100 ? "00" : hundredths);
    return (hours > 0 ? pad(hours, 2) : "00") + ":" + (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2); //+ ":" + hundredths;
}

function stopwatch() {
    timer.stop().once();
}

function everthingOk() {
    console.log("Insomnia up");
}

function errorNotOk() {
    console.log("Insomnia error");
}

// Cordova is loaded and it is now safe to call Cordova methods
//
function onDeviceReady() {
    // Register the event listener
    document.addEventListener("backbutton", onBackKeyDown, false);
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);


    $('#modal_all_indice').click(function () {

        navigator.notification.confirm(
            $("#all_founded_indice").text(),  // message
            null,                  // callback to invoke
            'Indices',            // title
            ['Merci !']            // buttonLabels
        );

    });


    $('#btn_pass').click(function () {

        navigator.notification.confirm(
            "Etes-vous certain de vouloir passer cette balise ? \n Vous allez perdre 150 points !",  // message
            onConfirmPassBtn,                  // callback to invoke
            'Passer la balise',            // title
            ['Oui', 'Non']            // buttonLabels
        );

    });


    // keep awake the app
    window.plugins.insomnia.keepAwake(everthingOk, errorNotOk);

    //initialize the app
    app.initialize();

    var isInit = window.localStorage.getItem("isInit");
    if (isInit != null) {
        navigator.notification.confirm("Une sauvegarde semble exister, voulez-vous continuer ?", onConfirmStorage, "Confirmation", "Continuer,Recommencer");
    }

    //save the app avery 10 secs
    window.setInterval(function () {
        saveLocalStorage();
    }, 10000);


}

function onConfirmPassBtn(button) {
    if (button == 1) {
        app.baliseCourante++;
        app.score -= 150;

        navigator.notification.confirm(
            "Vous avez passé la " + app.baliseCourante + "" + ((app.baliseCourante == 1) ? "re" : "e") + " balise et perdu 150 points !",  // message
            null,                  // callback to invoke
            'Balise passée',            // title
            ['Ok']            // buttonLabels
        );

        app.showView("#compass");
    }


}

function startTimer() {
    // Stopwatch element on the page
    var $stopwatch;

    // Timer speed in milliseconds
    var incrementTime = 70;

    // Current timer position in milliseconds
    // Output time and increment
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
        timer = $.timer(uptdateTimer, incrementTime, true);
    }


}

function onConfirmStorage(button) {
    if (button == 1) {
        //continuer
        loadLocalStorage();
    } else if (button == 2) {
        //reinit
        reinitLocalStorage();
    }
}

function reinitLocalStorage() {
    //delete local storage
    window.localStorage.clear();
}

function loadLocalStorage() {
    app.score = parseFloat(window.localStorage.getItem("score"));
    app.equipe = String(window.localStorage.getItem("equipe"));
    app.niveau = parseInt(window.localStorage.getItem("niveau"));
    app.parcours = parseInt(window.localStorage.getItem("parcours"));
    var tabOrdre = String(window.localStorage.getItem("parcoursOrdre"));
    app.parcoursOrdre = tabOrdre.split(",");
    app.infos = jQuery.parseJSON(window.localStorage.getItem("infos"));
    app.entrepreneurs = jQuery.parseJSON(window.localStorage.getItem("entrepreneurs"));
    app.baliseCourante = parseInt(window.localStorage.getItem("baliseCourante"));
    app.questionCourante = parseInt(window.localStorage.getItem("questionCourante"));
    app.entrepreneurSelect = String(window.localStorage.getItem("entrepreneurSelect"));
    app.entrepreneurATrouver = String(window.localStorage.getItem("entrepreneurATrouver"));
    app.nbBalisesTrouvees = parseInt(window.localStorage.getItem("nbBalisesTrouvees"));
    app.nbReponsesTrouvees = parseInt(window.localStorage.getItem("nbReponsesTrouvees"));
    app.isTimerLoaded = Boolean(window.localStorage.getItem("isTimerLoaded"));
    //reinit -> always launch
    app.isTimerLoaded = false;
    startTimer();

    var tab = String(window.localStorage.getItem("bonnesReponsesUser"));
    app.bonnesReponsesUser = (!tab.trim()) ? [] : tab.split(",");
    app.currentTime = parseInt(window.localStorage.getItem("currentTime"));
    var d = new Date();
    var now = d.getTime();
    var local = parseInt(window.localStorage.getItem("localTime"));
    var diff = Math.ceil(Math.abs(now - local));

    app.currentTime = parseInt(diff) + app.currentTime;
    app.currentTime = parseInt(app.currentTime);

    app.nbPointsCorrect = parseInt(window.localStorage.getItem("nbPointsCorrect"));
    var backupView = app.actualView;
    app.actualView = String(window.localStorage.getItem("actualView"));
    if (app.actualView != backupView) {
        app.showView(app.actualView);
    }


}

function saveLocalStorage() {


    window.localStorage.setItem("score", String(app.score));
    window.localStorage.setItem("equipe", String(app.equipe));
    window.localStorage.setItem("niveau", String(app.niveau));
    window.localStorage.setItem("parcours", String(app.parcours));
    window.localStorage.setItem("parcoursOrdre", String(app.parcoursOrdre));
    window.localStorage.setItem("infos", JSON.stringify(app.infos));
    window.localStorage.setItem("entrepreneurs", JSON.stringify(app.entrepreneurs));
    window.localStorage.setItem("baliseCourante", String(app.baliseCourante));
    window.localStorage.setItem("questionCourante", String(app.questionCourante));
    window.localStorage.setItem("entrepreneurSelect", String(app.entrepreneurSelect));
    window.localStorage.setItem("entrepreneurATrouver", String(app.entrepreneurATrouver));
    window.localStorage.setItem("nbBalisesTrouvees", String(app.nbBalisesTrouvees));
    window.localStorage.setItem("nbReponsesTrouvees", String(app.nbReponsesTrouvees));
    window.localStorage.setItem("isTimerLoaded", String(app.isTimerLoaded));
    window.localStorage.setItem("bonnesReponsesUser", String(app.bonnesReponsesUser));
    window.localStorage.setItem("currentTime", String(app.currentTime));
    var d = new Date();
    var n = d.getTime();
    window.localStorage.setItem("localTime", String(n));
    window.localStorage.setItem("nbPointsCorrect", String(app.nbPointsCorrect));
    window.localStorage.setItem("actualView", String(app.actualView));
    window.localStorage.setItem("isInit", "true");
}

function onPause() {
    saveLocalStorage();
}

function onResume() {
    loadLocalStorage();
}

function exitFromApp() {
    //reinitLocalStorage();
    saveLocalStorage();
    compass.stopLocation();
    compass.stopOrientation();
    navigator.app.exitApp();
}

function onBackKeyDown(e) {
    navigator.notification.confirm("Êtes-vous certains de vouloir quitter l'application ?", onConfirm, "Confirmation", "Rester,Sauver et Quitter");
}

function onConfirm(button) {
    if (button == 2) {
        exitFromApp();
    }
}

/**
 *  Charlie 15/02/2016
 *  Check si l'utilisateur est connecté à internet
 *  @return True or False
 **/
function checkConnection() {
    if (!navigator.network)
        navigator.network = window.top.navigator.network;

    return ( (navigator.network.connection.type === "none" || navigator.network.connection.type === null ||
        navigator.network.connection.type === "unknown" ) ? false : true );
}