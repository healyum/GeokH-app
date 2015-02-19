# GeoK'H
GeoK'H est une application de géocatching proposée par le [Hubhouse](http://www.univ-lille1.fr/etudes/hubhouse).
C'est une application basée sur Cordova, développée avec les technologies HTML5, CSS3 et Javascript.

## Pré-requis
[Cordova](http://www.cordova.apache.org) 4.2.0 ou supérieur.   
Pour plus d'information sur l'installation, suivre la [documentation](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface)

## Installation
Cloner le projet grace à la commande :

    $ git clone https://github.com/raphaelbauduin/geokh.git

## Lancement du projet
Se positioner dans le dossier "geokh" où se trouve les dossiers hooks, plugins, www et le fichier config.xml

Pour plus d'informations sur le lancement d'un projet Cordova, suivre la procedure disponible sur la [documentation](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface)

lister les platformes disponibles :

    $ cordova platforms ls

ajouter une plateforme (android pour l'exemple) : 

    $ cordova platform add android
    
compiler l'application pour toutes les plateformes:

    $ cordova build

lancer le projet sur une plateforme (android pour l'exemple) : 

    $ cordova run android
    
A noter que cette commande commence par compiler l'application pour la plateforme.

## Architecture
Comme le projet est une application cordova, elle est développée comme un site web "one-page". Chaque vue correspond donc à une section dans le fichier [index.html](https://github.com/raphaelbauduin/geokh/blob/master/geokh/www/index.html).

La gestion des enchaiements de vues et des interactions utilisateurs se fait grâce à l'objet javascript `app`, définit dans le fichier [index.js](https://github.com/raphaelbauduin/geokh/blob/master/geokh/www/js/index.js).  
La fonction `initialize()` va charger les données nécessaires au bon fonctionnement du jeu (les balises, les questions et les entrepreneurs).  
L'enchainement des vues est géré par la fonction `showView(view_id)` qui affiche la vue `view_id` et appelle la bonne fonction `showXXXView()` qui fait les calculs et les chargements spécifiques à la vue affichée.  
La gestion de la partie compas et géologalisation se fait dans l'objet javascript `compass`, définit dans le fichier [compass.js](https://github.com/raphaelbauduin/geokh/blob/master/geokh/www/js/compass.js).
