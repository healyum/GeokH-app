// Object app
var app = {
    actualView: '#accueil',
    urlApi: 'https://geokh.herokuapp.com/api',
    level: 1,
    numParcours: 0,
    infosParcours: null,
    nbAjaxExec: 0,
    entrepreneurs: [],
    entrepreneurSelect: null,
    entrepreneurToFind: null,
    currentMark: 0,
    isTimerLoaded: false,
    currentTime: 0,
    nbMarksFind: 0,
    nbAnswers: 0,
    goodAnswerUser: [],
    nbPointsCorrect: 500,

    // Initialisation cache les indices et affiche la vue actuelle
    initialize: function () {
        $('.indice').hide();

        this.showView(this.actualView);
    },

    showView: function (viewId) {
        $('.view').hide();
        $(viewId).show();

        this.actualView = viewId;

        // Appelle la fonction spécifique à la vue
        switch (viewId) {
            case '#compass':
                this.showBaliseView();
                break;

            case '#qr_code':
                this.showQrCodeView();
                break;

            case '#question':
                this.showQuestionBaliseView();
                break;

            case '#entrepreneurs':
                this.showQuestionBaliseView();
                break;

            case '#reponse':
                this.showReponseBaliseView();
                break;

            case '#entrepreneur_mystere':
                this.showEntrepreneurMystereView();
                break;

            case '#scores':
                this.showScoreView();
                break;

            default:
                break;
        }
    },

    // Récupère les parcours sur l'API
    showViewParcours: function () {
        $.ajax({
            url: app.urlApi + '/parcours',
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            crossDomain: true,
            data: {},

            success: function (data) {
                if (data.length == 0)
                    navigator.notification.confirm('Il n\'y a aucun parcours actif', null, 'Erreur', ['Ok']);

                for (var indexParcours = 0; indexParcours < data.length; indexParcours++) {
                    var input = document.createElement('input');
                    input.value = data[indexParcours]['id'];
                    input.setAttribute('type', 'radio');
                    input.setAttribute('name', 'form_parcours');
                    input.setAttribute('id', 'form_parcours' + indexParcours);

                    if (indexParcours == 0)
                        input.setAttribute('checked', 'checked');

                    var label = document.createElement('label');
                    label.setAttribute('for', 'form_parcours' + indexParcours);

                    label.appendChild(document.createTextNode('Parcours numéro ' + parseInt(indexParcours + 1)));
                    document.getElementById('form_parcours').appendChild(label);
                    document.getElementById('form_parcours').appendChild(input);
                }

                app.showView('#connexion');
            },

            error: function () {
                navigator.notification.confirm('Probleme de communication avec le serveur', null, 'Erreur', ['Ok']);
            }
        });
    },

    // Récupère les balises et les question d'un parcours
    showPtoBQS: function () {
        $.ajax({
            url: app.urlApi + '/ptobqs/parcour/' + app.numParcours,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            crossDomain: true,
            data: {},

            success: function (data) {
                app.infosParcours = data;
                app.nbAjaxExec++;

                if (app.nbAjaxExec == 2)
                    app.showView('#compass');
            },

            error: function () {
                navigator.notification.confirm('Probleme de communication avec le serveur', null, 'Erreur', ['Ok']);
                app.showView('#connexion');
            }
        });
    },

    // Récupère les entrepreneurs d'un parcours
    showPtoES: function () {
        $.ajax({
            url: app.urlApi + '/ptoes/parcour/' + app.numParcours,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            crossDomain: true,
            data: {},

            success: function (data) {
                app.entrepreneurs = data;
                app.entrepreneurToFind = randomIntFromInterval(0, app.entrepreneurs.length - 1);

                app.nbAjaxExec++;

                if (app.nbAjaxExec == 2)
                    app.showView('#compass');
            },

            error: function () {
                navigator.notification.confirm('Problème lors de la récupération des entrepreneurs', null, 'Erreur', ['OK']);
                app.showView('#connexion');
            }
        });
    },

    // Affiche le compass avec les informations nécessaires de la balise
    showBaliseView: function () {
        // Affiche le message (dist min 50m)
        $('#conseilHide').show();
        // Cache l'indice
        $('#compass .conseil .valeur').hide();

        // Incrémente la balise à chaque fois que la vue est appelée
        $('#numero_balise').html(this.currentMark++);

        $('#nombre_balise').html(this.infosParcours.length);

        // Ne pas activer le bouton "Passer la balise" lorsqu'il s'agit de la dernière
        if (this.baliseCourante == this.infosParcours.length - 1)
            document.getElementById('btn_pass').setAttribute('disabled', 'disabled');

        compass.stopLocation();
        compass.stopOrientation();
        compass.activateLocation();
        compass.activateOrientation();

        this.isTimerLoaded = true;
        startTimer();
    },

    // Affiche le scanner de QRCode
    showQrCodeView: function () {
        // Cache les boutons
        $('#btn_question').hide();
        $('#btn_entrepreneurs').hide();

        // Affiche bouton retour
        $('#btn_compass_retour').show();

        $('#qr_code_result').html('Flash du QR Code');

        var markToFind = 'codeBalise:' + this.infosParcours[this.currentMark]['Balise'].id;

        if (app.debugOnBrowser == false) {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    // Balise vide
                    if (result.text == '')
                        $('#qr_code_result').html('Aucun code flashé');

                    // Bonne balise
                    else if (result.text == markToFind) {
                        $('#qr_code_result').html('Bonne balise ! Félicitations !');
                        $('#btn_question').show();
                        $('#btn_compass_retour').hide();

                        // Si dernière question on affiche l'entrepreneur à trouver
                        if (app.currentMark == app.infosParcours.length - 1) {
                            $('#btn_entrepreneurs').show();
                            $('#btn_question').hide();
                        }
                    }
                    // Mauvaise balise
                    else
                        $('#qr_code_result').html('Mauvaise balise !');
                },

                function (error) {
                    $('#qr_code_result').html('Erreur du scanner: ' + error);
                }
            );
        }
    },

    // Affiche la question d'une balise
    showQuestionBaliseView: function () {
        compass.stopLocation();
        compass.stopOrientation();

        this.nbMarksFind++;

        // Si on est à la dernière balise question Entrepreneur
        if (this.currentMark == this.infosParcours.length - 1) {
            var q = this.infosParcours[this.currentMark]['Question'];

            document.getElementsByClassName('lib_question')['0'].text = q.question;

            for (var indexEntrepreneur = 0; indexEntrepreneur < this.entrepreneurs.length; indexEntrepreneur++) {
                var aMiniature = document.createElement('a');
                aMiniature.onclick = app.showEntrepeneur();

                var img = document.createElement('img');
                img.setAttribute('src', 'img/user.svg');
                img.setAttribute('alt', this.entrepreneurs[indexEntrepreneur].Entrepreneur.prenom + ' ' + this.entrepreneurs[indexEntrepreneur].Entrepreneur.nom);
                img.setAttribute('class', 'ent_min');

                aMiniature.appendChild(img);

                var div = document.createElement('div');
                div.setAttribute('id', '' + indexEntrepreneur);
                div.style['display'] = 'none';

                var p = document.createElement('p');
                p.setAttribute('class', "ent_nom");

                p.appendChild(document.createTextNode(this.entrepreneurs[indexEntrepreneur].Entrepreneur.prenom + ' ' + this.entrepreneurs[indexEntrepreneur].Entrepreneur.nom));

                var div_question = document.createElement('ent_desc');

                for (var indexQuestion = 0; indexQuestion < this.entrepreneurs[i].Entrepreneur.interviewQ.length; indexQuestion++) {
                    var p_question = document.createElement('p');
                    var p_reponse = document.createElement('p');

                    p_question.setAttribute('class', 'ent_question');
                    p_reponse.setAttribute('class', 'ent_reponse');

                    p_question.appendChild(document.createElement(this.entrepreneurs[indexEntrepreneur].Entrepreneur.interviewQ[indexQuestion]));
                    p_reponse.appendChild(document.createElement(this.entrepreneurs[indexEntrepreneur].Entrepreneur.interviewR[indexQuestion]));

                    div_question.appendChild(p_question);
                    div_question.appendChild(p_reponse);
                }

                div.appendChild(p);
                div.appendChild(div_question);
            }

            document.getElementsByClassName('ents_miniatures')[0].appendChild(aMiniature);
            document.getElementById('ents_presentation').appendChild(div);

            document.getElementById('modal_all_indice').setAttribute('disabled', 'false');

            var indices = "";

            for (var index = 0; index < this.goodAnswerUser.length; index++) {
                var indiceBonneRep = this.goodAnswerUser[index];
                indices += (index + 1) + " -> " + indiceBonneRep + "\n";
            }

            document.getElementById('all_founded_indice').appendChild(document.createTextNode(indices));

            this.showEntrepeneur(0);
        }
        else {
            var question = document.getElementById('question');

            var score = question.getElementsByClassName('score')[0];
            score.getElementsByClassName('valeur')[0].appendChild(document.createElement('span').appendChild(document.createTextNode(this.score)));

            var q = this.infos[this.baliseCourante]["Question"];

            var difficulte = question.getElementsByClassName('difficulte')[0];
            difficulte.getElementsByClassName('valeur')[0].appendChild(document.createElement('span').appendChild(document.createTextNode(q.difficulte)));

            var libQuestion = question.getElementsByClassName('lib_question')[0];
            libQuestion.getElementsByClassName('valeur')[0].appendChild(document.createElement('span').appendChild(document.createTextNode(q.question)));

            // Ajout des réponses
            var form = document.getElementById('form_question');
            var divReponses = form.getElementsByClassName('reponses')[0];

            // Si la question est un QCM, les réponses auront un checkbox
            if (q.type == "QCM") {
                for (var i = 0; i < q.propositions.length; i++) {
                    if (q.propositions[i] != "") {
                        var div = document.createElement('div');
                        var input = document.createElement('input');
                        var label = document.createElement('label');

                        div.setAttribute('class', 'form_groupe');

                        input.setAttribute('id', 'form_reponse' + (i + 1));
                        input.setAttribute('type', 'checkbox');
                        input.setAttribute('name', 'form_reponse[]');
                        input.setAttribute('value', '' + i + 1);

                        label.setAttribute('for', 'form_reponse' + (i + 1));
                        label.appendChild(document.createTextNode(q.propositions[i]));

                        div.appendChild(input);
                        div.appendChild(label);

                        divReponses.appendChild(div);
                    }
                }
            } else if (q.type == "QCU") {
                for (var i = 0; i < q.propositions.length; i++) {
                    if (q.propositions[i] != "") {
                        var div = document.createElement('div');
                        var input = document.createElement('input');
                        var label = document.createElement('label');

                        div.setAttribute('class', 'form_groupe');

                        input.setAttribute('id', 'form_reponse' + (i + 1));
                        input.setAttribute('type', 'radio');
                        input.setAttribute('name', 'form_reponse[]');
                        input.setAttribute('value', '' + i + 1);

                        label.setAttribute('for', 'form_reponse' + (i + 1));
                        label.appendChild(document.createTextNode(q.propositions[i]));

                        div.appendChild(input);
                        div.appendChild(label);

                        divReponses.appendChild(div);
                    }
                }
            }
        }
    },

    // Affiche la réponse de la balise
    showReponseBaliseView: function () {
        // Recuperation de(s) reponse(s) choisie(s) par l'utilisateur
        var form = document.getElementById('form_question');
        var reponses = form.getElementsByClassName('reponses');
        var inputs = reponses.getElementsByTagName('input');

        var reponsesSel = [];

        for (var index = 0; index < inputs.length; index++) {
            if (inputs[index].checked)
                reponsesSel.push(inputs[index].value * 1);
        }

        var q = this.infos[this.baliseCourante]["Question"];

        var isCorrect = false;
        var isAllCorrect = true;
        var nbOfCorrectAnswers = 0;

        while (index = 0 < reponsesSel.length) {
            for (var i = 0; i < q.questions.length; i++)
                if (reponsesSel[index].value == q.questions[i].value)
                    isCorrect = true;

            if (isCorrect)
                nbOfCorrectAnswers++;
            else
                isAllCorrect = false;

            index++;
        }

        var reponse = document.getElementById('reponse');
        var nbResponses = q.reponses.length;
        var scoreToAdd = 0;

        // Si toutes les réponses sont bonnes
        if (isAllCorrect && reponsesSel.length > 0) {
            if (nbResponses == nbOfCorrectAnswers) {
                reponse.getElementsByClassName('correct').style['display'] = 'block';
                reponse.getElementsByClassName('partial').style['display'] = 'none';

                scoreToAdd = document.getElementById('form_pari').value * q.difficulte;
            } else {
                // On ajoute les points que l'utilisateur a parié, multiplié par le niveau de la question, multiplié par un ratio de bonne réponses
                reponse.getElementsByClassName('correct').style['display'] = 'block';
                reponse.getElementsByClassName('partial').style['display'] = 'block';

                scoreToAdd = document.getElementById('form_pari').value * q.difficulte * (nbOfCorrectAnswers / nbResponses);
            }

            scoreToAdd = Math.round(scoreToAdd);
            this.score += scoreToAdd;

            reponse.getElementsByClassName('errone')[0].style['display'] = 'none';
            var bonus = reponse.getElementsByClassName('score')[0].getElementsByClassName('bonus')[0];

            bonus.removeChild(bonus.getElementsByTagName('span')[0]);
            var span = document.createElement('span');
            span.appendChild(document.createTextNode('' + scoreToAdd));
            bonus.appendChild(span);

            document.getElementById('modal_reponse').setAttribute('disabled', 'false');

            this.nbAnswers++;

            // La bonne reponse de l'utilisateur, utilisée pour garder les questions pour lesquelles ont peut afficher tous les indices a la fin !
            var indice = app.entrepreneurs[app.entrepreneurATrouver].Entrepreneur["indices"][this.baliseCourante];
            document.getElementById('reponse_indice').nodeValue = indice;
            this.goodAnswerUser.push(indice);
            navigator.notification.confirm(document.getElementById('reponse_indice').textContent, null, 'Indice', ['Merci !']);
        } else {
            // Retrait des points pariés
            this.score -= document.getElementById('form_pari').value * q.difficulte;

            document.getElementById('modal_all_indice').setAttribute('disabled', 'true');

            reponse.getElementsByClassName('errone')[0].style['display'] = 'block';
            reponse.getElementsByClassName('correct')[0].style['display'] = 'none';
            reponse.getElementsByClassName('partial')[0].style['display'] = 'none';

            var bonus = reponse.getElementsByClassName('score')[0].getElementsByClassName('bonus')[0];
            bonus.removeChild(bonus.getElementsByTagName('span')[0]);

            var span = document.createElement('span');
            span.appendChild(document.createTextNode('' + scoreToAdd));
            bonus.appendChild(span);
        }

        // Mise a jour du score actuel
        var valeur = reponse.getElementsByClassName('score')[0].getElementsByClassName('valeur')[0];
        valeur.removeChild(valeur.getElementsByTagName('span')[0]);

        var span = document.createElement('span');
        span.appendChild(document.createTextNode(this.score));
        valeur.appendChild(span);

        // Récupération des retours sur les réponses
        var retours = q.retours;

        // Affichage des retours
        var valeur = reponse.getElementsByClassName('retour')[0].getElementsByClassName('valeur')[0];
        valeur.nodeValue = '';

        for (var i = 0; i < retours.length; i++) {
            // Si l'élément est de type string c'est un paragraphe
            if (typeof retours[i] == "string") {
                valeur.appendChild(retours[i]);
            }
            // Sinon l'élément est une liste
            else {
                var liste = "<ul>";

                for (var j = 0; j < retours[i].length; j++) {
                    liste += "<li>" + retours[i][j] + "</li>";
                }

                liste += "</ul>";

                valeur.appendChild(liste);
            }
        }

        this.baliseCourante++;
    },

    // Affichage de l'entrepreneur
    showEntrepeneur: function (idEntrepreneur) {
        if (this.entrepreneurSelect != "")
            document.getElementById('' + this.entrepreneurSelect).style['display'] = 'none';

        document.getElementById('' + idEntrepreneur).style['display'] = 'block';

        this.entrepreneurSelect = idEntrepreneur;
    },

    // Affichage du score
    showScoreView: function () {
        var scores = document.getElementById('scores');

        var niveau = scores.getElementsByClassName('niveau')[0];
        niveau.getElementsByClassName('valeur')[0].appendChild(document.createTextNode('' + this.level));

        var balises = scores.getElementsByClassName('balises')[0];
        balises.getElementsByClassName('valeur')[0].appendChild(document.createTextNode('' + this.nbMarksFind));
        balises.getElementsByClassName('maximum')[0].appendChild(document.createTextNode('' + (this.infosParcours.length - 1)));

        balises.getElementsByClassName('valeur')[0].appendChild(document.createTextNode('' + this.nbMarksFind));
        balises.getElementsByClassName('maximum')[0].appendChild(document.createTextNode('' + (this.infosParcours.length - 1)));

        var reponses = scores.getElementsByClassName('reponses')[0];
        reponses.getElementsByClassName('valeur')[0].appendChild(document.createTextNode('' + this.nbAnswers));
        reponses.getElementsByClassName('maximum')[0].appendChild(document.createTextNode('' + (this.infosParcours.length - 1)));

        var paris = scores.getElementsByClassName('paris')[0];
        paris.removeChild(paris.getElementsByClassName('valeur'));

        var points = scores.getElementsByClassName('points')[0];
        points.getElementsByClassName('valeur')[0].appendChild(document.createTextNode('' + this.score));

        stopwatch();

        var timeString = formatTime(app.currentTime);
        document.getElementById('timer_final').appendChild(document.createTextNode('' + timeString));
    },

    // Affiche la vue des entrepreneurs mystères
    showEntrepreneurMystereView: function () {
        var balise = document.getElementById('entrepreneur_mystere');
        var correction = balise.getElementsByClassName('correction')[0];
        var score = balise.getElementsByClassName('score')[0];
        var bonus = score.document.getElementsByClassName('bonus')[0];

        // Bonne réponse trouvée
        if (this.entrepreneurSelect == this.entrepreneurToFind) {
            correction.document.getElementsByClassName('correct')[0].style['display'] = 'block';
            correction.document.getElementsByClassName('errone')[0].style['display'] = 'none';

            bonus.document.getElementsByTagName('span')[0].appendChild(document.createTextNode('' + app.nbPointsCorrect));
            bonus.style['display'] = 'block';

            this.score += app.nbPointsCorrect;
        } else {
            correction.document.getElementsByClassName('errone')[0].style['display'] = 'block';
            correction.document.getElementsByClassName('correct')[0].style['display'] = 'hide';

            bonus.style['display'] = 'none';
        }

        var entrepreneur = score.document.getElementsByClassName('ent_presentation')[0];

        entrepreneur.getElementsByClassName('ent_nom')[0].appendChild(document.createTextNode(this.entrepreneurs[this.entrepreneurATrouver].nom));
        entrepreneur.getElementsByClassName('ent_prenom')[0].appendChild(document.createTextNode(this.entrepreneurs[this.entrepreneurATrouver].prenom));

        score.document.getElementsByClassName('valeur')[0].appendChild(document.createTextNode('' + this.score));
    },
};

// Initialize the app
app.initialize();

// onLoad
window.onload = function () {

    // Evenements boutons
    document.getElementById('btn_connexion').onclick = function (event) {
        if (checkConnection())
            app.showViewParcours();
        else
            navigator.notification.confirm('Vous devez être connecté à internet pour jouer', null, 'Connexion internet requise', ['OK']);

        event.preventDefault();
    };

    document.getElementById('form_connexion').onsubmit = function (event) {
        var nbParcours = document.getElementsByName('form_parcours');

        for (var index = 0; index < nbParcours.length; index++) {
            if (nbParcours[index].checked)
                app.numParcours = nbParcours[index].value;
        }

        app.equipe = document.getElementById('form_equipe').value;

        app.showPtoBQS();
        app.showPtoES();

        event.preventDefault();
    };

    document.getElementById('btn_connexion_cgu').onclick = function (event) {
        app.showView('#connexion');

        event.preventDefault();
    };

    document.getElementById('btn_cgu').onclick = function (event) {
        app.showView('#cgu');

        event.preventDefault();
    };

    document.getElementById('btn_flash').onclick = function (event) {
        app.showView('#qr_code');

        event.preventDefault();
    };

    document.getElementById('btn_question').onclick = function (event) {
        app.showView('#question');

        event.preventDefault();
    };

    document.getElementById('form_question').onsubmit = function (event) {
        app.showView('#reponse');

        event.preventDefault();
    };

    document.getElementById('btn_compass_retour').onclick = function (event) {
        app.showView('#compass');

        event.preventDefault();
    };

    document.getElementById('btn_compass').onclick = function (event) {
        app.showView('#compass');

        event.preventDefault();
    };

    document.getElementById('btn_entrepreneurs').onclick = function (event) {
        app.showView('#entrepreneurs');

        event.preventDefault();
    };

    document.getElementById('btn_entrepreneur_mystere').onclick = function (event) {
        app.showView('#entrepreneur_mystere');

        event.preventDefault();
    };

    document.getElementById('btn_scores').onclick = function (event) {
        app.showView('#scores');

        event.preventDefault();
    };

    document.getElementById('btn_credits').onclick = function (event) {
        if (checkConnection())
            document.getElementById('btn_credits').setAttribute('disabled', 'true');
        else
            navigator.notification.confirm('Vous devez être connecté à internet pour envoyer votre score', null, 'Connexion internet requise', ['OK']);

        event.preventDefault();
    };

    document.getElementById('btn_quitter').onclick = function (event) {
        window.plugins.insomnia.allowSleepAgain();
        exitFromApp();

        event.preventDefault();
    };

    // appelle de onDeviceReady()
    document.addEventListener('deviceready', onDeviceReady, false);
};

// onDeviceReady
function onDeviceReady() {
    // Evenement boutons Android
    document.addEventListener('backbutton', onBackKeyDown, false);

    /* TODO
    document.addEventListener('pause', saveLocalStorage, false);
    document.addEventListener('resume', loadLocalStorage, false);
     */

    var modalIndice = document.getElementById('modal_all_indice');
    modalIndice.onclick = function () {
        navigator.notification.confirm(modalIndice.textContent, null, 'Indices', ['Merci !']);
    };

    document.getElementById('btn_pass').onclick = function () {
        navigator.notification.confirm('Etes-vous certain de vouloir passer cette balise ? \n Vous allez perdre 150 points !', onConfirmPassMark, 'Passer la balise', ['Oui', 'Non']);
    };

    // Enregistre l'application toutes les minutes
    /* TODO
    var isInit = window.localStorage.getItem('isInit');
    if (isInit != null)
        navigator.notification.confirm('Une sauvegarde semble exister, voulez-vous continuer ?', onConfirmStorage, 'Confirmation', ['Continuer', 'Recommencer']);

    window.setInterval(function () {
        saveLocalStorage();
    }, 60000);
    */
}