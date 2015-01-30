/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
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
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
    */
    showView: function showView(view_id) {
        $(".view").hide();
        $(view_id).show();
    }
};

app.initialize();

window.onload = function () {
    /*ENCHAINEMENT D'ECRAN PROVISOIRE*/
    $('#btn_connexion').click(function() {
        app.showView("#connexion");
    });

    $('#form_connexion').submit( function( event ) {
        app.showView("#compass");
        event.preventDefault();
    });

    $('#btn_flash').click(function() {
        app.showView("#question");
    });

    $('#form_question').submit( function( event ) {
        app.showView("#reponse");
        event.preventDefault();
    });

    $('#btn_compass').click(function() {
        app.showView("#compass");
    });
    $('#btn_entrepreneurs').click(function() {
        app.showView("#entrepreneurs");
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
