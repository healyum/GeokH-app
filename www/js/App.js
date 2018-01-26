// Object app
var app = {
    actualView: '#accueil',
    equipe: null,
    urlApi: 'https://geokh.herokuapp.com/api',
    level: 1,
    parcours: null,
    numParcours: 0,
    score: 0,
    infosParcours: null,
    entrepreneurs: null,
    entrepreneurToFind: null,
    entrepreneurSelect: 0,
    onInit: false,
    currentMark: 0,
    nbMarksFind: 0,
    nbAnswers: 0,
    bonusEntrepreneur: 500,
    currentTime: 0,
    indiceEntrepreneur: [],
    isTimerLoaded: false,

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
                $('.view').hide();
                $('#compass').show();
                break;

            case '#question':
                this.showQuestionView();
                break;

            case '#reponse':
                this.showReponseView();
                break;

            case '#entrepreneurs':
                this.showQuestionEntrepreneurView();
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
        this.parcours = jQuery.parseJSON((window.localStorage.getItem('parcours')));

        if (this.parcours === null) {
            navigator.notification.confirm('Aucun parcours enregistré. Mettez à jour les parcours !', null, 'Erreur', ['Ok']);
        }

        else {
            console.log("Utilisation du LocalStorage pour récupérer la liste des parcours");

            if (this.parcours !== null) {
                for (var indexParcours = 0; indexParcours < this.parcours.length; indexParcours++) {
                    var divForm = document.getElementById('form_parcours');

                    if (document.getElementById('form_parcours' + indexParcours) === null || document.getElementById('form_parcours' + indexParcours) === undefined) {
                        var input = document.createElement('input');
                        input.value = this.parcours[indexParcours]['id'];
                        input.setAttribute('type', 'radio');
                        input.setAttribute('name', 'form_parcours');
                        input.setAttribute('id', 'form_parcours' + indexParcours);

                        if (indexParcours == 0)
                            input.setAttribute('checked', 'checked');

                        var label = document.createElement('label');
                        label.setAttribute('for', 'form_parcours' + indexParcours);

                        label.appendChild(document.createTextNode('Parcours numéro ' + parseInt(indexParcours + 1)));
                        divForm.appendChild(input);
                        divForm.appendChild(label);
                        divForm.appendChild(document.createElement('br'));
                    }
                }
            }

            app.showView('#connexion');
        }
    },

    // Récupère les balises et les questions d'un parcours
    fetchInformationParcours: function () {
        this.infosParcours = jQuery.parseJSON((window.localStorage.getItem('infoParcours' + app.numParcours)));
        this.entrepreneurs = jQuery.parseJSON((window.localStorage.getItem('infoEntrepreneurs' + app.numParcours)));

        if (this.infosParcours === null || this.entrepreneurs === null) {
            navigator.notification.confirm('Les informations du parcours sont manquantes. Mettez à jour les parcours !', null, 'Erreur', ['Ok']);
        }

        else {
            console.log("Utilisation du LocalStorage pour récupérer la liste des balises / questions");
            console.log("Utilisation du LocalStorage pour récupérer la liste des entrepreneurs");

            this.entrepreneurToFind = randomIntFromInterval(0, this.entrepreneurs.length - 1);

            // Si les informations des questions et des entrepreneurs sont présents
            app.showView('#compass');
        }
    },

    // Affiche le compass avec les informations nécessaires de la balise
    showBaliseView: function () {
        if (!app.onInit) {
            compass.activateLocation();
            compass.activateOrientation();

            this.isTimerLoaded = true;
            startTimer();
        }

        // Affiche le message (dist min 50m)
        document.getElementById('conseilHide').style['display'] = 'block';
        // Cache l'indice
        document.getElementById('compass').getElementsByClassName('conseil')[0].getElementsByClassName('valeur')[0].style['display'] = 'none';
        document.getElementById('compass').getElementsByClassName('conseil')[0].getElementsByClassName('valeur')[0].textContent = '' + this.infosParcours[this.currentMark].Balise.indice;

        // Affiche le nombre de balises trouvées / nombre de balises totales
        document.getElementById('numero_balise').textContent = '' + (this.currentMark + 1);
        document.getElementById('nombre_balise').textContent = '' + (this.infosParcours.length);

        // Affiche le score
        document.getElementById('compass').getElementsByClassName('score')[0].getElementsByClassName('valeur')[0].textContent = '' + (this.score);

        // Ne pas activer le bouton "Passer la balise" lorsqu'il s'agit de la dernière balise
        if (this.currentMark == this.infosParcours.length - 1)
            document.getElementById('btn_pass').setAttribute('disabled', 'disabled');

        // Mise à jour du point de destination (Balise) pour le Compass
        this.infosParcours[this.currentMark].latitude
        compass.data.destination = new LatLon(this.infosParcours[this.currentMark].Balise.latitude, this.infosParcours[this.currentMark].Balise.longitude);
    },

    // Affiche le scanner de QRCode
    showQrCodeView: function () {
        // Cache les boutons
        //document.getElementById('btn_question').style['display'] = 'none';
        //document.getElementById('btn_entrepreneurs').style['display'] = 'none';

        //document.getElementById('qr_code_result').textContent = 'Flash du QR Code...';

        var markToFind = 'codeBalise:' + this.infosParcours[this.currentMark]['Balise'].id;

        cordova.plugins.barcodeScanner.scan(
            function (result) {
                //document.getElementById('btn_question').style['display'] = 'none';
                //document.getElementById('btn_compass_retour').style['display'] = 'block';

                // Balise vide
                if (result.text == '')
                    //document.getElementById('qr_code_result').textContent = 'Aucun code flashé...';
                    navigator.notification.confirm('Aucun code flashé', null, 'Resultat QR Code', ['OK']);

                // Bonne balise
                else if (result.text == markToFind) {
                    //document.getElementById('qr_code_result').textContent = 'Félicitations vous avez trouvé la bonne balise !';
                    //document.getElementById('btn_question').style['display'] = 'block';
                    //document.getElementById('btn_compass_retour').style['display'] = 'none';

                    // Si dernière question on affiche l'entrepreneur à trouver
                    if (app.currentMark == app.infosParcours.length - 1) {
                        navigator.notification.confirm('Félicitations vous avez trouvé la dernière balise !', app.showView("#entrepreneurs"), 'Resultat QR Code', ['OK']);
                        //document.getElementById('btn_entrepreneurs').style['display'] = 'block';
                        //document.getElementById('btn_question').style['display'] = 'none';
                    } else{
                        navigator.notification.confirm('Félicitations vous avez trouvé la bonne balise !', app.showView("#question"), 'Resultat QR Code', ['OK']);
                    }
                }
                // Mauvaise balise
                else
                    //document.getElementById('qr_code_result').textContent = 'Mauvaise balise...';
                    navigator.notification.confirm('Mauvaise balise', null, 'Resultat QR Code', ['OK']);
            },

            function (error) {
                //document.getElementById('qr_code_result').textContent = 'Erreur du scanner: ' + error;
                navigator.notification.confirm('Erreur du scanner: ' + error, null, 'Resultat QR Code', ['OK']);
            }
        );
    },

    // Affiche la question d'une balise
    showQuestionView: function () {
        this.nbMarksFind++;

        var q = this.infosParcours[this.currentMark]['Question'];
        var question = document.getElementById('question');

        var score = question.getElementsByClassName('score')[0].getElementsByClassName('valeur')[0];
        score.getElementsByTagName('span')[0].textContent = '' + this.score;

        var difficulte = question.getElementsByClassName('difficulte')[0].getElementsByClassName('valeur')[0];
        difficulte.getElementsByTagName('span')[0].textContent = '' + q.difficulte;

        var libQuestion = question.getElementsByClassName('lib_question')[0].getElementsByClassName('valeur')[0];
        libQuestion.getElementsByTagName('span')[0].textContent = '' + q.question;

        // Ajout des réponses
        var form = document.getElementById('form_question');
        var divReponses = form.getElementsByClassName('reponses')[0];
        var newDivReponses = document.createElement('div');
        newDivReponses.setAttribute('class', 'reponses');

        form.insertBefore(newDivReponses, divReponses);
        form.removeChild(form.getElementsByClassName('reponses')[1]);

        // Si la question est un QCM, les réponses auront un checkbox
        for (var i = 0; i < q.propositions.length; i++) {
            var div = document.createElement('div');
            var input = document.createElement('input');
            var label = document.createElement('label');

            div.setAttribute('class', 'form_groupe');

            input.setAttribute('id', 'form_reponse' + (i + 1));
            label.setAttribute('for', 'form_reponse' + (i + 1));
            input.setAttribute('value', '' + i + 1);
            input.setAttribute('name', 'form_reponse[]');
            input.setAttribute('selected', 'false');

            if (q.type == "QCM") {
                if (q.propositions[i] != "") {
                    input.setAttribute('type', 'checkbox');

                    label.appendChild(document.createTextNode(q.propositions[i]));
                }
            } else if (q.type == "QCU") {
                if (q.propositions[i] != "") {
                    input.setAttribute('type', 'radio');

                    label.appendChild(document.createTextNode(q.propositions[i]));
                }
            }

            div.appendChild(input);
            div.appendChild(label);

            newDivReponses.appendChild(div);
        }
    },

    // Affiche la réponse d'une balise
    showReponseView: function () {
        // Recuperation de(s) reponse(s) choisie(s) par l'utilisateur
        var form = document.getElementById('form_question');
        var reponses = form.getElementsByClassName('reponses')[0];
        var inputs = reponses.getElementsByTagName('input');

        var reponsesSel = [];

        for (var index = 0; index < inputs.length; index++) {
            if (inputs[index].checked)
                reponsesSel.push(parseInt(index) + 1);
        }

        var q = this.infosParcours[this.currentMark]["Question"];

        var isAllCorrect = true;
        var nbOfCorrectAnswers = 0;

        for (var i = 0; i < q.reponses.length; i++) {

            var haveResponse = false;

            for (var j = 0; j < reponsesSel.length; j++) {
                if (q.reponses[i] == reponsesSel[j]) {
                    haveResponse = true;
                    nbOfCorrectAnswers++;
                }
            }

            if (haveResponse == false)
                isAllCorrect = false;
        }

        var reponse = document.getElementById('reponse');
        var scoreToAdd = 0;

        var nbResponses = q.reponses.length;

        // Si toutes les réponses sont bonnes
        if (nbOfCorrectAnswers > 0 && reponsesSel.length > 0) {
            if (isAllCorrect) {
                reponse.getElementsByClassName('correct')[0].style['display'] = 'block';
                reponse.getElementsByClassName('partial')[0].style['display'] = 'none';

                scoreToAdd = Math.round(document.getElementById('form_pari').value * q.difficulte);
            } else {
                reponse.getElementsByClassName('correct')[0].style['display'] = 'none';
                reponse.getElementsByClassName('partial')[0].style['display'] = 'block';

                scoreToAdd = Math.round(document.getElementById('form_pari').value * q.difficulte * (nbOfCorrectAnswers / nbResponses));
            }

            this.score += scoreToAdd;

            reponse.getElementsByClassName('errone')[0].style['display'] = 'none';
            var bonus = reponse.getElementsByClassName('score')[0].getElementsByClassName('bonus')[0];
            bonus.getElementsByTagName('span')[0].textContent = scoreToAdd;

            this.nbAnswers++;

            // Avec la bonne réponse on enregistre un indice pour trouver l'entrepreneur mystère
            var indice = app.entrepreneurs[app.entrepreneurToFind].Entrepreneur["indices"][this.currentMark];
            document.getElementById('reponse_indice').textContent = indice;
            this.indiceEntrepreneur.push(indice);
            navigator.notification.confirm(document.getElementById('reponse_indice').textContent, null, 'Indice', ['Merci !']);
        }
        // Toutes les réponses sont fausses
        else {
            this.score -= document.getElementById('form_pari').value * q.difficulte;

            reponse.getElementsByClassName('errone')[0].style['display'] = 'block';
            reponse.getElementsByClassName('correct')[0].style['display'] = 'none';
            reponse.getElementsByClassName('partial')[0].style['display'] = 'none';

            var bonus = reponse.getElementsByClassName('score')[0].getElementsByClassName('bonus')[0];
            bonus.getElementsByTagName('span')[0].textContent = scoreToAdd;
        }

        // Mise a jour du score actuel
        var valeur = reponse.getElementsByClassName('score')[0].getElementsByClassName('valeur')[0];
        valeur.getElementsByTagName('span')[0].textContent = this.score;

        // Affichage des retours
        var valeur = reponse.getElementsByClassName('retour')[0].getElementsByClassName('valeur')[0];
        valeur.textContent = '';

        // Récupération des retours sur les réponses
        var retours = q.retours;

        for (var i = 0; i < retours.length; i++) {
            // Si l'élément est de type string c'est un paragraphe
            if (typeof retours[i] == "string") {
                valeur.textContent = retours[i];
            }
            // Sinon l'élément est une liste
            else {
                var liste = "<ul>";

                for (var j = 0; j < retours[i].length; j++)
                    liste += "<li>" + retours[i][j] + "</li>";

                liste += "</ul>";

                valeur.appendChild(liste);
            }
        }

        this.currentMark++;
    },

    // Affichage de l'entrepreneur
    showEntrepeneur: function (idEntrepreneur) {
        document.getElementById('ent' + this.entrepreneurSelect).style['display'] = 'none';
        document.getElementById('ent' + idEntrepreneur).style['display'] = 'block';

        this.entrepreneurSelect = idEntrepreneur;

        return false;
    },

    // Question sur l'entrepreneur mystère si on est sur la dernière balise
    showQuestionEntrepreneurView: function () {
        this.nbMarksFind++;

        for (var i = 0; i < this.entrepreneurs.length; i++) {
            var img = document.createElement('img');
            img.setAttribute('src', 'img/user.svg');
            img.setAttribute('alt', this.entrepreneurs[i].Entrepreneur.prenom + ' ' + this.entrepreneurs[i].Entrepreneur.nom);
            img.setAttribute('class', 'ent_min');
            img.setAttribute('onclick', 'app.showEntrepeneur(' + i + ')');

            document.getElementsByClassName('ents_miniatures')[0].appendChild(img);

            var div = document.createElement('div');
            div.setAttribute('id', 'ent' + i);
            div.style['display'] = 'none';

            var p = document.createElement('p');
            p.setAttribute('class', 'ent_nom');

            p.appendChild(document.createTextNode(this.entrepreneurs[i].Entrepreneur.prenom + ' ' + this.entrepreneurs[i].Entrepreneur.nom));

            var div_question = document.createElement('ent_desc');

            for (var j = 0; j < this.entrepreneurs[i].Entrepreneur.interviewQ.length; j++) {
                var p_question = document.createElement('p');
                var p_reponse = document.createElement('p');

                p_question.setAttribute('class', 'ent_question');
                p_reponse.setAttribute('class', 'ent_reponse');

                p_question.appendChild(document.createTextNode(this.entrepreneurs[i].Entrepreneur.interviewQ[j]));
                p_reponse.appendChild(document.createTextNode(this.entrepreneurs[i].Entrepreneur.interviewR[j]));

                div_question.appendChild(p_question);
                div_question.appendChild(p_reponse);
            }

            div.appendChild(p);
            div.appendChild(div_question);
            document.getElementById('ents_presentation').appendChild(div);

            this.showEntrepeneur(0);
        }

        var indices = "";

        for (var index = 0; index < this.indiceEntrepreneur.length; index++) {
            var indiceBonneRep = this.indiceEntrepreneur[index];
            indices += (index + 1) + " -> " + indiceBonneRep + "\n";
        }

        if (this.indiceEntrepreneur.length == 0)
            indices = "Aucun indice trouvé";

        document.getElementById('all_founded_indice').appendChild(document.createTextNode(indices));
    },

    // Affiche la vue des entrepreneurs mystères
    showEntrepreneurMystereView: function () {
        var balise = document.getElementById('entrepreneur_mystere');
        var correction = balise.getElementsByClassName('correction')[0];
        var score = balise.getElementsByClassName('score')[0];
        var bonus = score.getElementsByClassName('bonus')[0];

        // Bonne réponse trouvée
        if (this.entrepreneurSelect == this.entrepreneurToFind) {
            this.nbAnswers++;

            correction.getElementsByClassName('correct')[0].style['display'] = 'block';
            correction.getElementsByClassName('errone')[0].style['display'] = 'none';

            bonus.appendChild(document.createTextNode('+' + this.bonusEntrepreneur));
            bonus.style['display'] = 'block';

            this.score += this.bonusEntrepreneur;
        } else {
            correction.getElementsByClassName('errone')[0].style['display'] = 'block';
            correction.getElementsByClassName('correct')[0].style['display'] = 'none';

            bonus.style['display'] = 'none';
        }

        var entrepreneur = balise.getElementsByClassName('ent_presentation')[0];

        entrepreneur.getElementsByClassName('ent_myst_nom')[0].appendChild(document.createTextNode(this.entrepreneurs[this.entrepreneurToFind].Entrepreneur.nom));
        entrepreneur.getElementsByClassName('ent_myst_prenom')[0].appendChild(document.createTextNode(this.entrepreneurs[this.entrepreneurToFind].Entrepreneur.prenom));

        score.getElementsByClassName('valeur')[0].appendChild(document.createTextNode('' + this.score));
    },

    // Affichage du score
    showScoreView: function () {
        document.getElementsByClassName("team")[0].textContent = '' + this.equipe;

        var displayLevel = "Débutant";

        if (displayLevel == 2)
            displayLevel = "Intermédiaire";
        else if (displayLevel == 3)
            displayLevel = "Difficile";

        document.getElementsByClassName("niveau-valeur")[0].textContent = '' + displayLevel;

        stopwatch();

        var timeString = formatTime(this.currentTime);
        document.getElementById('timer_final').appendChild(document.createTextNode('' + timeString));

        document.getElementsByClassName("balise-valeur")[0].textContent = '' + this.nbMarksFind;
        document.getElementsByClassName("balise-maximum")[0].textContent = '' + this.infosParcours.length;

        document.getElementsByClassName("reponse-valeur")[0].textContent = '' + this.nbAnswers;
        document.getElementsByClassName("reponse-maximum")[0].textContent = '' + this.infosParcours.length;

        document.getElementsByClassName("point-valeur")[0].textContent = '' + this.score;
    },
};

// Initialize the app
app.initialize();

// onLoad
window.onload = function () {

    // Evenements boutons
    document.getElementById('btn_connexion').onclick = function (event) {
        app.showViewParcours();
    };

    document.getElementById('btn_maj').onclick = function (event) {
        if (checkConnection()) {
            window.localStorage.clear();

            AjaxRequest.fetchAllParcours();
        }
        else
            navigator.notification.confirm('Vous devez être connecté pour mettre à jour les parcours.', null, 'Connexion internet requise', ['OK']);

        event.preventDefault();
    };

    document.getElementById('form_connexion').onsubmit = function (event) {
        var nbParcours = document.getElementsByName('form_parcours');

        for (var index = 0; index < nbParcours.length; index++) {
            if (nbParcours[index].checked)
                app.numParcours = nbParcours[index].value;
        }

        app.equipe = document.getElementById('form_equipe').value;

        app.fetchInformationParcours();

        event.preventDefault();
    };

    document.getElementById('btn_flash').onclick = function (event) {
        app.showView('#qr_code');

        event.preventDefault();
    };

    document.getElementById('btn_pass').onclick = function () {
        navigator.notification.confirm('Etes-vous certain de vouloir passer cette balise ? \n Vous allez perdre 150 points !', onConfirmPassMark, 'Passer la balise', ['Oui', 'Non']);
    };

    document.getElementById('btn_compass_retour').onclick = function (event) {
        app.showView('#compass');

        event.preventDefault();
    };

   document.getElementById("btn_question").onclick = function (event) {
        app.showView("#question");

        event.preventDefault();
    };

    document.getElementById('form_question').onsubmit = function (event) {
        app.showView('#reponse');

        event.preventDefault();
    };

    document.getElementById('btn_quitter').onclick = function (event) {
        window.plugins.insomnia.allowSleepAgain();
        exitFromApp();

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
        app.showView("#entrepreneur_mystere");

        event.preventDefault();
    };

    var modalIndice = document.getElementById('modal_all_indice');
    modalIndice.onclick = function () {
        navigator.notification.confirm(document.getElementById("all_founded_indice").textContent, null, 'Indices', ['Merci !']);
    };

    document.getElementById('btn_scores').onclick = function (event) {
        app.showView('#scores');

        event.preventDefault();
    };

    // appelle de onDeviceReady()
    document.addEventListener('deviceready', onDeviceReady, false);
};

// onDeviceReady
function onDeviceReady() {
    // Evenement boutons Android
    document.addEventListener('backbutton', onBackKeyDown, false);

    window.plugins.insomnia.keepAwake();

}