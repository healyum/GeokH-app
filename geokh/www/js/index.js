/**
 *
 * Auteurs : Goblot Pauline et Bauduin Raphael
 *
 */
var app = {
    //Application variables
    //score tout au long du jeu
    score: 0,
    //nom de l'equipe
    equipe: "",
    //niveau choisit
    niveau: 1,
    //parcours choisit
    parcours: 1,
    //les balises a chercher
    balises: {},
    //les questions a poser
    questions: {},
    //les entrepreneurs
    entrepreneurs: {},
    //prochaine balise cherchée
    balise_courante: 1,
    //prochaine balise question posée
    question_courante: "",
    //
    entrepreneur_select: "",
    entrepreneur_aTrouver: "entrepreneur_1",
    nb_balises_trouvees: 0,
    nb_reponses_trouvees: 0,


    // Application Constructor
    initialize: function initialize() {
        //chargement des balises
        this.balises = balises.balises;
        //chargement des questions
        this.questions = questions.questions;
        //chargement des entrepreneurs
        this.entrepreneurs = entrepreneurs.entrepreneurs;

        //affichage de la première vue
        this.showView("#accueil");
    },
    /*
     * Gere l'affichage de la vue demandée.
     */
    showView: function showView(view_id) {
        $(".view").hide();
        $(view_id).show();
        switch (view_id) {
            case "#connexion":
                this.showConnexionView();
                break;
            case "#compass":
                this.showBaliseView();
                break;
            case "#qr_code":
                this.showQrCodeView();
                break;
            case "#question":
                this.showQuestionBaliseView();
                break;
            case "#reponse":
                this.showReponseBaliseView();
                break;
            case "#entrepreneurs":
                this.showQuestionBaliseView();
                break;
            case "#entrepreneur_mystere":
                this.showEntrepreneurMystereView();
                break;
            case "#scores":
                this.showScoreView();
                break;
            case "#credits":
                this.showCreditsView();
                break;
            default :
                break;
        }
    },
    /*
     * charge les informations pour la vue de recherche de balise
     */
    showBaliseView: function showBaliseView() {
		compass.stopLocation();
		compass.stopOrientation();
        //lancement de la recherche de position et de l'orientation
        compass.activateLocation();
        compass.activateOrientation();

        //affichage du score actuel
        $('#compass .score .valeur span').text(this.score);

        //affichage du conseil pour trouver la balise
        $('#compass .conseil .valeur').text(this.balises["balise_" + this.balise_courante].indice);

        //définition du point gps de la balise
        //la distance et la précision sont mises à jour par les fonctions updateDistance() et updatePrecision()
        compass.data.destination = new LatLon(this.balises["balise_" + this.balise_courante].latitude, this.balises["balise_" + this.balise_courante].longitude);


        //timer
        var $countdown;
        var incrementTime = 70;
        var currentTime = 300000; // 5 minutes (in milliseconds)

        $(function () {
            // Setup the timer
            $countdown = $('#timerdec');
            this.timer = $.timer(updateTimer, incrementTime, true);

        });

        // Common functions
        function pad(number, length) {
            var str = '' + number;
            while (str.length < length) {str = '0' + str;}
            return str;
        }
        
        function formatTime(time) {
            time = time / 10;
            var min = parseInt(time / 6000),
                sec = parseInt(time / 100) - (min * 60),
                hundredths = pad(time - (sec * 100) - (min * 6000), 2);
            return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2) + ":" + hundredths;
        }
        
        function updateTimer() {

            // Output timer position
            var timeString = formatTime(currentTime);
            $countdown.html(timeString);

            // If timer is complete, trigger alert
            if (currentTime == 0) {
                this.timer.stop();
                alert('Temps terminé !');
                return;
            }

            // Increment timer position
            currentTime -= incrementTime;
            if (currentTime < 0) currentTime = 0;

        }

        if (this.balise_courante == (Object.keys(this.balises).length)) {
            $("#btn_entrepreneurs").show();
            $("#btn_flash").hide();
        } else {
            $("#btn_entrepreneurs").hide();
            $("#btn_flash").show();
        }
    },

    /*
     * Verifie les infos de formulaires de connexion
     */
    showConnexionView: function showConnexionView() {
       /*
        $('#form_connexion').validate({
            rules: {
                form_equipe: {
                    required: true,
                    minlength: 3
                }
            },
            messages: {
                form_equipe: {
                    required: "Merci d'entrer un nom d'équipe."
                }
            }
        });
        */
    },
    /*
     * Charge les informations pour la vue de question
     */
    showQrCodeView: function showQrCodeView() {
        $('#btn_question').show();
        $("#qr_code_result").html("Flash du QR Code");
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                //TODO check si code = balise recherchée
                if (result.text == "") {
                    $("#qr_code_result").html("Aucun code flashé");
                } else {
                    $("#qr_code_result").html("Code flashé : " + result.text);
                }
                $('#btn_question').show();
            },
            function (error) {
                $("#qr_code_result").html("Scanning failed: " + error);
            }
        );
    },

    /*
     * Charge les informations pour la vue de question 
     */
    showQuestionBaliseView: function showQuestionBaliseView() {
        compass.stopLocation();
		compass.stopOrientation();
        this.nb_balises_trouvees++;

        //si on est à la dernière balise, l'affichage de la question est différent
        if (this.balise_courante == (Object.keys(this.balises).length)) {

            //récupération des informations sur la question à afficher 
            this.question_courante = this.balises["balise_" + this.balise_courante].question;

            //affichage de la question
            $('#entrepreneurs .lib_question').text(this.questions[this.question_courante].question);

            //recupération des informations des entrepreneurs
            var entrepreneurs_liste = [];
            for (var i = 0; i < this.questions[this.question_courante].propositions.length; i++) {
                entrepreneurs_liste.push(this.entrepreneurs[this.questions[this.question_courante].propositions[i]]);
            }
            ;

            var html_miniatures = "";
            var html_entrepreneur = "";

            for (var i = 0; i < entrepreneurs_liste.length; i++) {
                html_miniatures += '<a href="#" onclick="app.showEnt(\'' + this.questions[this.question_courante].propositions[i] + '\'); return false;">'
                + '<img src="img/user.svg" alt="' + entrepreneurs_liste[i].prenom + ' ' + entrepreneurs_liste[i].nom + '" class="ent_min" />'
                + '</a>';
                html_entrepreneur += '<div id="' + this.questions[this.question_courante].propositions[i] + '" style="display: none;">'
                + '<p class="ent_nom">' + entrepreneurs_liste[i].prenom + ' ' + entrepreneurs_liste[i].nom + '</p>'
                + '<div class="ent_desc">';
                for (var j = 0; j < entrepreneurs_liste[i].interview.length; j++) {
                    html_entrepreneur += '<p class="ent_question">' + entrepreneurs_liste[i].interview[j].question + '</p>';
                    for (var k = 0; k < entrepreneurs_liste[i].interview[j].reponses.length; k++) {
                        html_entrepreneur += '<p class="ent_reponse">' + entrepreneurs_liste[i].interview[j].reponses[k] + '</p>';
                    }
                }
                html_entrepreneur += '</div></div>';
            }
            ;
            $('#entrepreneurs .ents_miniatures').html(html_miniatures);
            $('#entrepreneurs #ents_presentation').html(html_entrepreneur);
            this.showEnt("entrepreneur_1");

        } else {
            //mise à jour du score actuel
            $('#question .score .valeur span').text(this.score);

            //récupération des informations sur la question à afficher 
            this.question_courante = this.balises["balise_" + this.balise_courante].question;

            //affichage de la difficutlé
            $('#question .difficulte .valeur span').text(this.questions[this.question_courante].difficulte);
            //affichage de la question
            $('#question .lib_question .valeur span').text(this.questions[this.question_courante].question);

            //ajout des réponses
            $('#form_question .reponses').html('');
            //si la question est un QCM, les réponses auront un checkbox
            if (this.questions[this.question_courante].type == "QCM") {
                for (var i = 0; i < this.questions[this.question_courante].propositions.length; i++) {
                    $('#form_question .reponses').append('<div class="form_groupe"><input type="checkbox" name="form_reponse[]" id="form_reponse' + (i + 1) + '" value="' + (i + 1) + '" /><label for="form_reponse' + (i + 1) + '">' + this.questions[this.question_courante].propositions[i] + '</label></div>');
                }
                //si la question est un QCU, les réponses auront un bouton radio
            } else if (this.questions[this.question_courante].type == "QCU") {
                for (var i = 0; i < this.questions[this.question_courante].propositions.length; i++) {
                    $('#form_question .reponses').append('<div class="form_groupe"><input type="radio" name="form_reponse" id="form_reponse' + (i + 1) + '" value="' + (i + 1) + '" /><label for="form_reponse' + (i + 1) + '">' + this.questions[this.question_courante].propositions[i] + '</label></div>');
                }
            }
        }
    },
    /*
     * charge les informations pour la vue des réponses à une question
     */
    showReponseBaliseView: function showReponseBaliseView() {

        //recuperation de(s) reponse(s) choisie(s) par l'utilisateur 
        var input_reponses_courante = $('#form_question .reponses input:checked');

        //recuperation de(s) bonne(s) reponse(s)
        var reponses_courantes = [];
        for (var i = 0; i < input_reponses_courante.length; i++) {
            reponses_courantes.push($(input_reponses_courante[i]).val() * 1);
        }
        var nb_reponses = this.questions[this.question_courante].reponses.length;

        //test si l'utilisateur a donne la(les) bonne(s) reponse(s).
        //s'il n'y a pas le même nombre de réponses entre l'utilisateur et celles du fichier alors l'utilisateur n'a pas la bonne réponse.
        var is_correct = true;
        if (reponses_courantes.length == nb_reponses) {
            var i = 0;
            while (is_correct && i < nb_reponses) {
                //comme les réponses sont toujours dans le même ordre il suffit de comparer la réponse de l'utlisateur à celle du fichier au même indice.
                is_correct = reponses_courantes[i] == this.questions[this.question_courante].reponses[i];
                i++;
            }
        } else {
            is_correct = false;
        }

        if (is_correct) {
            //on ajoute les points que l'utilisateur a parié
            this.score += $('#form_pari').val() * 1;

            $("#reponse .errone").hide();
            $("#reponse .correct").show();
            $('#reponse .score .bonus span').text($('#form_pari').val());

            //on augmente le nombre de bonnes réponses pour les statistiques finales
            this.nb_reponses_trouvees++;
        } else {
            $("#reponse .errone").show();
            $("#reponse .correct").hide();
        }

        //mise a jour du score actuel
        $('#reponse .score .valeur span').text(this.score);

        //récupération des retours sur les réponses
        var retours = this.questions[this.question_courante].retour;

        //affichage des retours
        $('#reponse .retour .valeur').html("");
        for (var i = 0; i < retours.length; i++) {
            //si l'élément est de type string c'est un paragraphe
            if (typeof retours[i] == "string") {
                $('#reponse .retour .valeur').append(retours[i]);
                //sinon l'élément est une liste
            } else {
                var liste = "<ul>";
                for (var j = 0; j < retours[i].length; j++) {
                    liste += "<li>" + retours[i][j] + "</li>";
                }
                liste += "</ul>";
                $('#reponse .retour .valeur').append(liste);
            }
        }

        this.balise_courante++;
    },
    /*
     * Charge les informations pour la vue de l'entrepreneur mystere
     */
    showEntrepreneurMystereView: function showEntrepreneurMystereView() {
        var nb_points_correct = 50;
        //si l'utilisateur a choisi le bon entrepreneur
        if (this.entrepreneur_select == this.entrepreneur_aTrouver) {
            $("#entrepreneur_mystere .correction .correct").show();
            $("#entrepreneur_mystere .correction .errone").hide();
            $("#entrepreneur_mystere .score .bonus span").html(nb_points_correct);
            $("#entrepreneur_mystere .score .bonus").show();
            this.score += nb_points_correct;
        } else {
            $("#entrepreneur_mystere .correction .errone").show();
            $("#entrepreneur_mystere .correction .correct").hide();
            $("#entrepreneur_mystere .score .bonus").hide();
        }
        ;
        $("#entrepreneur_mystere .ent_presentation .ent_nom").html(this.entrepreneurs[this.entrepreneur_aTrouver].nom);
        $("#entrepreneur_mystere .ent_presentation .ent_prenom").html(this.entrepreneurs[this.entrepreneur_aTrouver].prenom);

        $("#entrepreneur_mystere .score .valeur").html(this.score);
    },
    /*
     * Charge les informations pour la vue de récapitulatif des scores
     */
    showScoreView: function showScoreView() {
        $("#scores .niveau .valeur").html(this.niveau);
        $("#scores .balises .valeur").html(this.nb_balises_trouvees);
        $("#scores .balises .maximum").html(Object.keys(this.balises).length);

        $("#scores .reponses .valeur").html(this.nb_reponses_trouvees);
        $("#scores .reponses .maximum").html(Object.keys(this.balises).length);

        $("#scores .paris .valeur").html();

        $("#scores .points .valeur").html(this.score);
    },
    /*
     * Anime l'image de compass pour qu'il indique tous le temps la bonne direction
     */
    rotate: function rotate(_angle) {
        $('#compass_elt').rotate(_angle);
    },
    /*
     * change l'entrepreuneur visible
     */
    showEnt: function showEnt(ent) {
        if (this.entrepreneur_select != "") {
            $("#entrepreneurs #ents_presentation #" + this.entrepreneur_select).hide();
        }
        $("#entrepreneurs #ents_presentation #" + ent).show();
        this.entrepreneur_select = ent;
    },
    updateDistance: function updateDistance(distance) {
        $('#compass .distance .valeur span').text(distance);
    },
    updatePrecision: function updatePrecision(precision) {
        $('#compass .precision .valeur span').text(precision);
    }
};

app.initialize();

window.onload = function () {
    $('#btn_connexion').click(function () {
        app.showView("#connexion");
    });

    $('#form_connexion').submit(function (event) {
        app.showView("#compass");
        event.preventDefault();
    });

    $('#btn_flash').click(function () {
        app.showView("#qr_code");
        event.preventDefault();
    });

    $('#btn_question').click(function () {
        app.showView("#question");
        event.preventDefault();
    });

    $('#form_question').submit(function (event) {
        app.showView("#reponse");

        event.preventDefault();
    });

    $('#btn_compass').click(function () {
        app.showView("#compass");
        event.preventDefault();
    });

    $('#btn_entrepreneurs').click(function () {
        app.showView("#entrepreneurs");
    });

    $('#btn_entrepreneur_mystere').click(function () {
        app.showView("#entrepreneur_mystere");
    });

    $('#btn_scores').click(function () {
        app.showView("#scores");
    });

    $('#btn_credits').click(function () {
        app.showView("#credits");
    });


}
