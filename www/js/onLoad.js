window.onload = function () {

    document.getElementById("btn_connexion").onclick = function(event) {
        if (checkConnection())
            app.showViewParcours();
        else {
            navigator.notification.confirm("Vous devez être connecté à internet pour jouer.", null, "Connection Internet Requise", ["OK"]);
            app.showView("#accueil");
        }

        event.preventDefault();
    };

    document.getElementById("btn_connexion_cgu").onclick = function(event) {
        app.showView("#connexion");

        event.preventDefault();
    };

    document.getElementById("btn_cgu").onclick = function(event) {
        app.showView("#cgu");

        event.preventDefault();
    };

    document.getElementById("form_connexion").onsubmit = function(event) {
        var nbParcours = document.getElementsByName("form_parcours");

        for (var index = 0; index < nbParcours; index++) {
            if (nbParcours[index].checked)
                app.parcours = nbParcours[index].value;
        }

        app.equipe = document.getElementById("form_equipe").value;

        app.showPtoBQS();
        app.showPtoES();
        app.showView("#compass");

        event.preventDefault();
    };

    document.getElementById("btn_flash").onclick = function(event) {
        app.showView("#qr_code");

        event.preventDefault();
    };

    document.getElementById("btn_question").onclick = function(event) {
        app.showView("#question");

        event.preventDefault();
    };

    document.getElementById("form_question").onsubmit = function(event) {
        app.showView("#reponse");

        event.preventDefault();
    };

    document.getElementById("btn_compass_retour").onclick = function(event) {
        app.showView("#compass");

        event.preventDefault();
    };

    document.getElementById("btn_compass").onclick = function(event) {
        app.showView("#compass");

        event.preventDefault();
    };

    document.getElementById("btn_entrepreneurs").onclick = function(event) {
        app.showView("#entrepreneurs");

        event.preventDefault();
    };

    document.getElementById("btn_entrepreneur_mystere").onclick = function(event) {
        app.showView("#entrepreneur_mystere");

        event.preventDefault();
    };

    document.getElementById("btn_scores").onclick = function(event) {
        app.showView("#scores");

        event.preventDefault();
    };

    document.getElementById("btn_credits").onclick = function(event) {
        if (checkConnection()) {
            document.getElementById("btn_credits").setAttribute("disabled", "true");
            app.envoyerScore();
        } else
            navigator.notification.confirm("Vous devez être connecté à internet pour envoyer votre score.", null, "Connection Internet Requise", ["OK"]);

        event.preventDefault();
    };

    document.getElementById("btn_quitter").onclick = function(event) {
        window.plugins.insomnia.allowSleepAgain();
        exitFromApp();

        event.preventDefault();
    };

    document.addEventListener("deviceready", onDeviceReady, false);
};