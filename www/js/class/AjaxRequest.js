var AjaxRequest = {
    urlApi: 'https://geokh.herokuapp.com/api',

    fetchAllParcours: function () {
        console.log("Requete AJAX pour récupérer la liste des parcours");

        $.ajax({
            url: AjaxRequest.urlApi + '/parcours',
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            crossDomain: true,
            data: {},

            success: function (data) {
                app.parcours = data;
                window.localStorage.setItem('parcours', JSON.stringify(data));

                app.parcours.forEach(function(element) {
                    AjaxRequest.fetchMarksAndQuestions(element['id']);
                    AjaxRequest.fetchEntrepreneurs(element['id']);
                });

                navigator.notification.confirm('Mise à jour effectuée !', null, 'Parfait', ['Ok']);
            },

            error: function () {
                navigator.notification.confirm('Probleme de communication avec le serveur', null, 'Erreur', ['Ok']);
            }
        });
    },

    fetchMarksAndQuestions: function (numParcours) {
        console.log("Requete AJAX pour récupérer les questions et les balises d'un parcours");

        $.ajax({
            url: AjaxRequest.urlApi + '/ptobqs/parcour/' + numParcours,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            crossDomain: true,
            data: {},

            success: function (data) {
                app.infosParcours = data;
                window.localStorage.setItem('infoParcours' + numParcours, JSON.stringify(data));
            },

            error: function () {
                navigator.notification.confirm('Probleme de communication avec le serveur', null, 'Erreur', ['Ok']);
            }
        });
    },

    fetchEntrepreneurs: function (numParcours) {
        console.log("Requete AJAX pour récupérer les entrepreneurs d'un parcours");

        $.ajax({
            url: AjaxRequest.urlApi + '/ptoes/parcour/' + numParcours,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            crossDomain: true,
            data: {},

            success: function (data) {
                app.entrepreneurs = data;
                window.localStorage.setItem('infoEntrepreneurs' + numParcours, JSON.stringify(data));
            },

            error: function () {
                navigator.notification.confirm('Problème lors de la récupération des entrepreneurs', null, 'Erreur', ['OK']);
            }
        });
    },
}