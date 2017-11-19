// Object app
var app = {
    actualView: '#accueil',
    urlApi: 'https://geokh.herokuapp.com/api',
    level: 1,
    numParcours: 0,
    infosParcours: null,
    nbAjaxExec: 0,
    entrepreneurs: [],
    entrepreneurToFind: null,
    onInit: false,
    currentMark: 0,
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

        // Affiche le numéro de balise
        document.getElementById('numero_balise').textContent = '' + (this.currentMark + 1);

        // Affiche le total de balise
        document.getElementById('nombre_balise').textContent = '' + (this.infosParcours.length);

        // Ne pas activer le bouton "Passer la balise" lorsqu'il s'agit de la dernière balise
        if (this.currentMark == this.infosParcours.length - 1)
            document.getElementById('btn_pass').setAttribute('disabled', 'disabled');
    },

    // Affiche le scanner de QRCode
    showQrCodeView: function () {
        // Cache les boutons
        document.getElementById('btn_question').style['display'] = 'none';
        document.getElementById('btn_entrepreneurs').style['display'] = 'none';

        document.getElementById('qr_code_result').textContent = 'Flash du QR Code...';

        var markToFind = 'codeBalise:' + this.infosParcours[this.currentMark]['Balise'].id;

        cordova.plugins.barcodeScanner.scan(
            function (result) {
                // Balise vide
                if (result.text == '')
                    document.getElementById('qr_code_result').textContent = 'Aucun code flashé...';

                // Bonne balise
                else if (result.text == markToFind) {
                    document.getElementById('qr_code_result').textContent = 'Félicitations vous avez trouvé la bonne balise !';
                    document.getElementById('btn_question').style['display'] = 'block';
                    document.getElementById('btn_compass_retour').style['display'] = 'none';

                    // Si dernière question on affiche l'entrepreneur à trouver
                    if (app.currentMark == app.infosParcours.length - 1) {
                        document.getElementById('btn_entrepreneurs').style['display'] = 'block';
                        document.getElementById('btn_question').style['display'] = 'none';
                    }
                }
                // Mauvaise balise
                else
                    document.getElementById('qr_code_result').textContent = 'Mauvaise balise...';
            },

            function (error) {
                document.getElementById('qr_code_result').textContent = 'Erreur du scanner: ' + error;
            }
        );
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

    document.getElementById('btn_flash').onclick = function (event) {
        app.showView('#qr_code');

        event.preventDefault();
    };

    document.getElementById('btn_compass_retour').onclick = function (event) {
        app.showView('#compass');

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

    var modalIndice = document.getElementById('modal_all_indice');
    modalIndice.onclick = function () {
        navigator.notification.confirm(modalIndice.textContent, null, 'Indices', ['Merci !']);
    };

    document.getElementById('btn_pass').onclick = function () {
        navigator.notification.confirm('Etes-vous certain de vouloir passer cette balise ? \n Vous allez perdre 150 points !', onConfirmPassMark, 'Passer la balise', ['Oui', 'Non']);
    };
}