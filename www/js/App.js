var app = {
    //Application variables
    score: 0,
    equipe: null,
    niveau: 1,
    parcours: 0,
    infos: null,

    urlApi: "https://geokh.herokuapp.com/api",

    parcoursOrdre: [],
    balises: {},
    questions: {},
    baliseCourante: 0,
    questionCourante: 0,

    // Les entrepreneurs
    entrepreneurs: {},
    entrepreneurSelect: null,
    entrepreneurATrouver: null,

    nbBalisesTrouvees: 0,
    nbReponsesTrouvees: 0,
    isTimerLoaded: false,
    bonnesReponsesUser: [],
    currentTime: 0,
    debugOnBrowser: false,
    nbPointsCorrect: 500,
    actualView: "#accueil",
    distanceMinToShowIndice: 50,


    // Application Constructor
    initialize: function initialize() {
        // Cache tous les indices
        $(".indice").hide();

        // Affichage de la vue Accueil
        this.showView("#accueil");
    },


    // Gere l'affichage des vues
    showView: function showView(viewId) {

        // Cache la précédente vue
        $(".view").hide();
        // Affichage de la nouvelle vue
        $(viewId).show();

        this.actualView = viewId;

        switch (viewId) {
            case "#connexion":
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

    // Récupère les parcours sur l'API
    showViewParcours: function showViewParcours() {
        $.ajax({
            url: this.urlApi + "/parcours",
            type: "GET",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            crossDomain: true,
            data: {},

            success: function(data) {
                if (data.length == 0)
                    navigator.notification.confirm("Il n'y a aucun parcours actif", null, "Erreur", ["Ok"]);

                for (var indexParcours = 0; indexParcours < data.length; indexParcours++) {
                    var input = document.createElement("input");
                    input.value = data[indexParcours]['id'];
                    input.setAttribute("type", "radio");
                    input.setAttribute("name", "form_parcours");
                    input.setAttribute("id", "form_parcours" + indexParcours);

                    if (indexParcours == 0)
                        input.setAttribute("checked", "checked");

                    var label = document.createElement("label");
                    label.setAttribute("for", "form_parcours" + indexParcours);

                    label.appendChild(document.createTextNode("Parcours numéro " + parseInt(indexParcours+1)));
                    document.getElementById("form_parcours").appendChild(label);
                    document.getElementById("form_parcours").appendChild(input);
                }

                app.showView("#connexion");
            },

            error: function () {
                navigator.notification.confirm("Probleme de communication avec le serveur", null, "Erreur", ["Ok"]);
            }
        });
    },


    /*
     * @author Charlie
     * Récupère les balises et les questions d'un parcours
     */
    showPtoBQS: function showPtoBQS() {
        $.ajax({
            context: this,
            url: this.urlApi + "/ptobqs/parcour/" + app.parcours,
            type: "GET",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            crossDomain: true,
            async:false,
            success: function(data) {
                this.infos = data;
            },

            error: function () {
                navigator.notification.confirm("Probleme de communication avec le serveur", null, "Erreur", ["Ok"]);
            }
        });
    },

    /*
     * @author Charlie
     * Récupère les entrepreneurs d'un parcours
     */

    showPtoES: function showPtoES() {
        $.ajax({
            method: "GET",
            crossDomain: true,
            async: false,
            contentType: "application/json; charset=utf-8",
            url: this.urlApi + '/ptoes/parcour/' + app.parcours,
            data: {},
            error: function (xhr, textStatus, err) {
                navigator.notification.confirm("Problème lors de la récupération des entrepreneurs.", null, "Erreur", ["OK"]);
                app.showView("#connexion");
            }
        }).done(function (data) {
            app.entrepreneurs = data;
            app.entrepreneurATrouver = randomIntFromInterval(0, app.entrepreneurs.length - 1);
        });
    },

    /* @modified : charlie
     * charge les informations pour la vue de recherche de balise
     */
    showBaliseView: function showBaliseView() {

        //cacher les conseils pour les balises par défaut
        $('#conseilHide').show();
        $('#compass .conseil .valeur').hide();
        $("#numero_balise").html(this.baliseCourante + 1);
        // ajout
        $("#nombre_balise").html(this.infos.length);
        if (this.baliseCourante == this.infos.length - 1) {
            $("#btn_pass").attr("disabled", "disabled");
        }
        this.isTimerLoaded = true;
        if (app.debugOnBrowser == false) {
            compass.stopLocation();
            compass.stopOrientation();
            //lancement de la recherche de position et de l'orientation
            compass.activateLocation();
            compass.activateOrientation();
        }
        //affichage du score actuel
        // $('#compass .score .valeur span').text(this.score);
        //affichage du conseil pour trouver la balise
        // $('#compass .conseil .valeur').text(this.infos[this.baliseCourante]["Balise"].indice);
        //définition du point gps de la balise
        //la distance et la précision sont mises à jour par les fonctions updateDistance() et updatePrecision()
        //  compass.data.destination = new LatLon(this.infos[this.baliseCourante]["Balise"]["latitude"], this.infos[this.baliseCourante]["Balise"]["longitude"]);
        startTimer();

    },

    /*
     * Charge les informations pour la vue de question
     */
    showQrCodeView: function showQrCodeView() {
        $('#btn_question').hide();
        $("#btn_entrepreneurs").hide();
        $('#btn_compass_retour').show();
        $("#qr_code_result").html("Flash du QR Code");
        var textATrouver = 'codeBalise:' + this.infos[this.baliseCourante]['Balise'].id;
        if (app.debugOnBrowser == false) {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (result.text == "") {
                        $("#qr_code_result").html("Aucun code flashé");
                    } else if (result.text == textATrouver) {
                        $("#qr_code_result").html("Bonne balise ! Félicitations !");
                        $('#btn_question').show();
                        $('#btn_compass_retour').hide();
                        if (app.baliseCourante == app.infos.length - 1) {
                            $("#btn_entrepreneurs").show();
                            $('#btn_question').hide();
                        }
                    } else {
                        $("#qr_code_result").html("Mauvaise balise !");
                    }

                },
                function (error) {
                    $("#qr_code_result").html("Scanning failed: " + error);
                }
            );
        }
    },
    /*
     * Charge les informations pour la vue de question
     */
    showQuestionBaliseView: function showQuestionBaliseView() {

        if (app.debugOnBrowser == false) {
            compass.stopLocation();
            compass.stopOrientation();
        }
        this.nbBalisesTrouvees++;

        //si on est à la dernière balise, l'affichage de la question est différent
        if (this.baliseCourante == this.infos.length - 1) {

            var q = this.infos[this.baliseCourante]["Question"];
            //affichage de la question
            $('#entrepreneurs .lib_question').text(q.question);


            var html_miniatures = "";
            var html_entrepreneur = "";

            for (var i = 0; i < this.entrepreneurs.length; i++) {
                html_miniatures += '<a href="#" onclick="app.showEnt(\'' + i + '\'); return false;">'
                    + '<img src="img/user.svg" alt="' + this.entrepreneurs[i].Entrepreneur.prenom + ' ' + this.entrepreneurs[i].Entrepreneur.nom + '" class="ent_min" />'
                    + '</a>';
                html_entrepreneur += '<div id="' + i + '" style="display: none;">'
                    + '<p class="ent_nom">' + this.entrepreneurs[i].Entrepreneur.prenom + ' ' + this.entrepreneurs[i].Entrepreneur.nom + '</p>'
                    + '<div class="ent_desc">';
                for (var j = 0; j < this.entrepreneurs[i].Entrepreneur.interviewQ.length; j++) {
                    // Question de l'interview
                    html_entrepreneur += '<p class="ent_question">' + this.entrepreneurs[i].Entrepreneur.interviewQ[j] + '</p>';
                    html_entrepreneur += '<p class="ent_reponse">' + this.entrepreneurs[i].Entrepreneur.interviewR[j] + '</p>';
                }
                html_entrepreneur += '</div></div>';
            }
            $('#entrepreneurs .ents_miniatures').html(html_miniatures);
            $('#entrepreneurs #ents_presentation').html(html_entrepreneur);

            $('#modal_all_indice').prop('disabled', false);
            var indices = "";

            for (var i = 0; i < this.bonnesReponsesUser.length; i++) {
                var indiceBonneRep = this.bonnesReponsesUser[i];
                indices += (i + 1) + " -> " + indiceBonneRep + "\n";
            }
            $('#all_founded_indice').text(indices);

            //on montre la premiere page pour commencer, hardcode ok

            this.showEnt(0);


        } else {

            //mise à jour du score actuel
            $('#question .score .valeur span').text(this.score);

            //récupération des informations sur la question à afficher
            var q = this.infos[this.baliseCourante]["Question"];
            //affichage de la difficutlé
            $('#question .difficulte .valeur span').text(q.difficulte);
            //affichage de la question
            $('#question .lib_question .valeur span').text(q.question);

            //ajout des réponses
            $('#form_question .reponses').html('');
            //si la question est un QCM, les réponses auront un checkbox
            if (q.type == "QCM") {
                for (var i = 0; i < q.propositions.length; i++) {
                    if (q.propositions[i] != "")
                        $('#form_question .reponses').append('<div class="form_groupe"><input type="checkbox" name="form_reponse[]" id="form_reponse' + (i + 1) + '" value="' + (i + 1) + '" /><label for="form_reponse' + (i + 1) + '">' + q.propositions[i] + '</label></div>');
                }
                //si la question est un QCU, les réponses auront un bouton radio
            } else if (q.type == "QCU") {
                for (var i = 0; i < q.propositions.length; i++) {
                    if (q.propositions[i] != "")
                        $('#form_question .reponses').append('<div class="form_groupe"><input type="radio" name="form_reponse" id="form_reponse' + (i + 1) + '" value="' + (i + 1) + '" /><label for="form_reponse' + (i + 1) + '">' + q.propositions[i] + '</label></div>');
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
        var q = this.infos[this.baliseCourante]["Question"];

        var nb_reponses = q.reponses.length;

        //test si l'utilisateur a donne la(les) bonne(s) reponse(s).
        //s'il n'y a pas le même nombre de réponses entre l'utilisateur et celles du fichier alors l'utilisateur n'a pas la bonne réponse.
        var is_correct = false;
        var is_all_correct = true;
        var nbOfCorrectAnswers = 0;
        var i = 0;

        while (i < reponses_courantes.length) {
            is_correct = $.inArray(reponses_courantes[i], q.reponses) > -1 ? true : false;
            if (is_correct) nbOfCorrectAnswers++;
            if (is_correct == false) is_all_correct = false;
            i++;
        }

        var scoreToAdd = 0;
        //si tout les reponses fournies sont bonnes
        if (is_all_correct && reponses_courantes.length > 0) {
            //si on a tout donné de correct
            //on peut simplifé en gardant la seconde expression, mais pour des soucis de clarté on préfere gardé si par la suite
            //il y a d'autre changements concernant les points

            if (nb_reponses == nbOfCorrectAnswers) {
                //on ajoute les points que l'utilisateur a parié
                //multiplié par le niveau de la question
                $("#reponse .correct").show();
                $("#reponse .partial").hide();
                scoreToAdd = $('#form_pari').val() * q.difficulte;
            } else {
                //on ajoute les points que l'utilisateur a parié
                //multiplié par le niveau de la question
                //multiplié par un ratio de bonne réponses
                $("#reponse .partial").show();
                $("#reponse .correct").show();
                scoreToAdd = $('#form_pari').val() * q.difficulte * (nbOfCorrectAnswers / nb_reponses);
            }

            scoreToAdd = Math.round(scoreToAdd);
            this.score += scoreToAdd;

            $("#reponse .errone").hide();

            $('#reponse .score .bonus span').text(scoreToAdd);

            //on laisse le bouton ouvert
            $('#modal_reponse').prop('disabled', false);

            //on augmente le nombre de bonnes réponses pour les statistiques finales
            this.nbReponsesTrouvees++;

            //la bonne reponse de l'utilisateur, utilisé pour garder les questions pour lesquelles ont peut afficher tous les indices a la fin !

            var indice = app.entrepreneurs[app.entrepreneurATrouver].Entrepreneur["indices"][this.baliseCourante];
            $('#reponse_indice').text(indice);
            this.bonnesReponsesUser.push(indice);
            //notif indice bonne réponse
            navigator.notification.confirm(
                $("#reponse_indice").text(),  // message
                null,                  // callback to invoke
                'Indice',            // title
                ['Merci !']            // buttonLabels
            );


        } else {
            //retrait des points pariés
            this.score -= $('#form_pari').val() * q.difficulte;

            //disable le bouton d'indice
            $('#modal_reponse').prop('disabled', true);
            $("#reponse .errone").show();
            $("#reponse .correct").hide();
            $("#reponse .partial").hide();
            $('#reponse .score .bonus span').text(scoreToAdd);
        }

        //mise a jour du score actuel
        $('#reponse .score .valeur span').text(this.score);

        //récupération des retours sur les réponses
        var retours = q.retours;

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

        this.baliseCourante++;
    },

    /*
     * Charge les informations pour la vue de l'entrepreneur mystere
     */
    showEntrepreneurMystereView: function showEntrepreneurMystereView() {

        //si l'utilisateur a choisi le bon entrepreneur
        if (this.entrepreneurSelect == this.entrepreneurATrouver) {
            $("#entrepreneur_mystere .correction .correct").show();
            $("#entrepreneur_mystere .correction .errone").hide();
            $("#entrepreneur_mystere .score .bonus span").html(app.nbPointsCorrect);
            $("#entrepreneur_mystere .score .bonus").show();
            this.score += app.nbPointsCorrect;
        } else {
            $("#entrepreneur_mystere .correction .errone").show();
            $("#entrepreneur_mystere .correction .correct").hide();
            $("#entrepreneur_mystere .score .bonus").hide();
        }
        $("#entrepreneur_mystere .ent_presentation .ent_nom").html(this.entrepreneurs[this.entrepreneurATrouver].nom);
        $("#entrepreneur_mystere .ent_presentation .ent_prenom").html(this.entrepreneurs[this.entrepreneurATrouver].prenom);

        $("#entrepreneur_mystere .score .valeur").html(this.score);
    },

    /*
     * Charge les informations pour la vue de récapitulatif des scores
     */
    showScoreView: function showScoreView() {
        $("#scores .niveau .valeur").html(this.niveau);
        $("#scores .balises .valeur").html(this.nbBalisesTrouvees);
        $("#scores .balises .maximum").html(this.infos.length - 1);

        $("#scores .reponses .valeur").html(this.nbReponsesTrouvees);
        $("#scores .reponses .maximum").html(this.infos.length - 1);

        $("#scores .paris .valeur").html();

        $("#scores .points .valeur").html(this.score);

        stopwatch();
        var timeString = formatTime(app.currentTime);
        $("#timer_final").html(timeString);

    },

    envoyerScore: function envoyerScore() {
        $.ajax({
            method: "POST",
            crossDomain: true,
            async: true,
            contentType: "application/json; charset=utf-8",
            url: this.urlApi + 'api/scores/create/' + app.parcours,
            data: JSON.stringify({
                'niveau': this.niveau,
                'nbBalisesTrouvees': this.nbBalisesTrouvees,
                'nbReponsesTrouvees': this.nbReponsesTrouvees,
                'score': this.score,
                'temps': formatTime(app.currentTime),
                'nom': app.equipe
            }),
            error: function (xhr, textStatus, err) {
                alert("Erreur lors de l'envoie du score.");
            },
            success: function (data) {
                alert("Le score a été correctement envoyé.");
                app.showView("#credits");
            }
        });

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
        if (this.entrepreneurSelect != "") {
            $("#entrepreneurs #ents_presentation #" + this.entrepreneurSelect).hide();
        }

        $("#entrepreneurs #ents_presentation #" + ent).show();

        this.entrepreneurSelect = ent;
    },
    updateDistance: function updateDistance(distance) {

        if (distance < app.distanceMinToShowIndice) {
            $('#compass .conseil .valeur').show();
            $('#conseilHide').hide();
        } else {
            $('#conseilHide').show();
            $('#compass .conseil .valeur').hide();
        }
        $('#compass .distance .valeur span').text(distance);
    },
    updatePrecision: function updatePrecision(precision) {
        $('#compass .precision .valeur span').text(precision);
    }
};
