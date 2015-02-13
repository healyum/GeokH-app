/**
 * 
 * Auteurs : Goblot Pauline et Bauduin Raphael
 * 
 */
var app = {
    score: 0,
    equipe: "",
    niveau: 1,
    parcours: 1,
    balise_courante : 10,
    question_courante : "",


    // Application Constructor
    initialize: function initialize() {
        console.log("initializing.");
        this.showView("#accueil");
        //this.bindEvents();
    },/* 
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        compass.activateLocation();
        compass.activateOrientation();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },*/
    showView: function showView(view_id) {
        $(".view").hide();
        $(view_id).show();
    },
    rotate: function rotate(_angle){
        $('#compass_elt').rotate(_angle);
    }
};

app.initialize();

window.onload = function () {
    /*ENCHAINEMENT D'ECRAN PROVISOIRE*/
    $('#btn_connexion').click(function() {
        app.showView("#connexion");
    });

    $('#form_connexion').submit( function( event ) {
        compass.activateLocation();
        compass.activateOrientation();

        app.showView("#compass");
        // Affichage du score
        $('#compass .score .valeur span').text(app.score);
        $('#compass .conseil .valeur').text(balises.balises["balise_"+app.balise_courante].indice)
        var latitude = balises.balises["balise_"+app.balise_courante].latitude;
        var longitude = balises.balises["balise_"+app.balise_courante].longitude;

        compass.data.destination = new LatLon(balises.balises["balise_"+app.balise_courante].latitude, balises.balises["balise_"+app.balise_courante].longitude);
        // initialisation du chrono


        event.preventDefault();
    });

    $('#btn_flash').click(function() {
        app.showView("#question");
        $('#question .score .valeur span').text(app.score);

        app.question_courante = balises.balises["balise_"+app.balise_courante].question;

        $('#question .difficulte .valeur span').text(questions.questions[app.question_courante].difficulte);
        $('#question .lib_question .valeur span').text(questions.questions[app.question_courante].question);

        $('#form_question .reponses').html('');
        if(questions.questions[app.question_courante].type == "QCM"){
            for(var i=0; i < questions.questions[app.question_courante].propositions.length; i++){
                $('#form_question .reponses').append( '<input type="checkbox" name="form_reponse[]" id="form_reponse'+(i+1)+'" value="'+(i+1)+'" /><label for="form_reponse'+(i+1)+'">'+questions.questions[app.question_courante].propositions[i]+'</label>' );
            }
        }else if(questions.questions[app.question_courante].type == "QCU"){
            for(var i=0; i < questions.questions[app.question_courante].propositions.length; i++){
                $('#form_question .reponses').append( '<input type="radio" name="form_reponse" id="form_reponse'+(i+1)+'" value="'+(i+1)+'" /><label for="form_reponse'+(i+1)+'">'+questions.questions[app.question_courante].propositions[i]+'</label>' );
            }
        }
    });

    $('#form_question').submit( function( event ) {
        app.showView("#reponse");
        var input_reponses_courante = $('#form_question .reponses input:checked');

        var reponses_courantes = [];
        for(var i =0; i< input_reponses_courante.length; i++){
            reponses_courantes.push($(input_reponses_courante[i]).val()*1);
        }

        var nb_reponses = questions.questions[app.question_courante].reponses.length;
        var is_correct= true;
        if(reponses_courantes.length == nb_reponses){
            var i = 0;
            while(is_correct && i < nb_reponses){
                is_correct = reponses_courantes[i] == questions.questions[app.question_courante].reponses[i];
                i++;
            }
        } else {
            is_correct = false;
        }

        if(is_correct){
            app.score += $('#form_pari').val()*1;
            $("#reponse .errone").hide();
            $("#reponse .correct").show();
            $('#reponse .score .bonus span').text($('#form_pari').val());
        }else {
            $("#reponse .errone").show();
            $("#reponse .correct").hide();
        }
        $('#reponse .score .valeur span').text(app.score);
        var retours = questions.questions[app.question_courante].retour;

        $('#reponse .retour .valeur').html("");
        for(var p in retours){
            //$('#reponse .retour .valeur')
            console.log(typeof retours[p]);
            console.log(retours[p]);
            if(typeof retours[p] == "string"){
                $('#reponse .retour .valeur').append(retours[p]);
            }else {
                var liste = "<ul>";
                for(elt in retours[p]){
                    liste+= "<li>"+retours[p][elt]+"</li>";
                }
                liste+= "</ul>";
                $('#reponse .retour .valeur').append(liste);
            }
        }


        if(app.balise_courante == (Object.keys(balises.balises).length-1)){
            $('#btn_entrepreneurs').show();
            $('#btn_compass').hide();
        }else {
            $('#btn_entrepreneurs').hide();
            $('#btn_compass').show();
            app.balise_courante++;
        }
        event.preventDefault();
    });

    $('#btn_compass').click(function() {
        app.showView("#compass");
    });
    $('#btn_entrepreneurs').click(function() {
        app.showView("#entrepreneurs");
        var entrepreneurs = entrepreneurs.entrepreneurs;

        for(var i in entrepreneurs){
            var html_minitaures = '<a href="#" onclick="/*fonction showEnt(id_ent)*/return false;">'
                                    +'<img src="img/user.svg" alt="'+entrepreneurs[i].prenom+''+entrepreneurs[i].nom+'" class="ent_min" />'
                                    +'</a>';
            var html_entrepreneur = '<div id="ent_pres"'+i+'>'
                                    + '<p class="ent_nom">'+entrepreneurs[i].prenom+''+entrepreneurs[i].nom+'</p>'
                                    + '<div class="ent_desc">'
                                    +   '<p>';
            //ici il faut ajouter les questions et les réponses dans html_entrepreneur
            html_entrepreneur += '</p>'
                                + '</div>';

            //les appends (le clear avant)
        }
    });

    $('#btn_entrepreneur_mystere').click(function() {
        app.showView("#entrepreneur_mystere");
    });

    $('#btn_scores').click(function() {
        app.showView("#scores");
    });

    $('#btn_credits').click(function() {
        app.showView("#credits");
    });

    
}
