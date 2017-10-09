# Geok'H Mobile App
Geok'H est une application mobile de [geocaching](http://fr.wikipedia.org/wiki/Géocaching) proposée par le [Hubhouse](http://www.univ-lille1.fr/etudes/hubhouse).
C'est une application développée avec les technologies HTML5, CSS3 et Javascript en utilisant le framework Cordova.

## Pré-requis
Installer le framework [Cordova](http://www.cordova.apache.org) 4.2.0 ou supérieur.
Pour plus d'information sur l'installation, suivre la [documentation](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface)

## Installation
Cloner le projet grâce à la commande :

    $ git clone https://github.com/raphaelbauduin/geokh.git

## Lancement du projet
Se positioner dans le dossier "geokh" où se trouvent les dossiers `hooks`, `plugins`, `www` et le fichier `config.xml`.

Pour plus d'informations sur le lancement d'un projet Cordova, suivre la procédure disponible sur la [documentation](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface)

Lister les plateformes disponibles :

    $ cordova platforms ls

Ajouter une plateforme (android pour l'exemple) : 

    $ cordova platform add android@6.2.3
    
Compiler l'application pour toutes les plateformes:

    $ cordova build

Lancer le projet sur une plateforme (android pour l'exemple) : 

    $ cordova run android
    
À noter que cette commande commence par compiler l'application pour la plate-forme Android.

## Architecture
Comme le projet est une application Cordova, il est développé comme un site web "one-page".
Chaque vue correspond donc à une section dans le fichier [index.html](https://github.com/raphaelbauduin/geokh/blob/master/geokh/www/index.html).

La gestion des enchainements des vues et des interactions utilisateurs se fait grâce à l'objet javascript `app`, défini dans le fichier [index.js](https://github.com/raphaelbauduin/geokh/blob/master/geokh/www/js/index.js).  
La fonction `initialize()` charge les données nécessaires au bon fonctionnement du jeu (*i.e.*, les balises, les questions et les entrepreneurs).
L'enchainement des vues est géré par la fonction `showView(view_id)` qui affiche la vue `view_id` et appelle la bonne fonction `showXXXView()` qui fait les calculs et les chargements spécifiques à la vue affichée.  

La gestion de la partie compas et géo-localisation se fait dans l'objet javascript `compass`, défini dans le fichier [compass.js](https://github.com/raphaelbauduin/geokh/blob/master/geokh/www/js/compass.js).
