PARCOURS TECHNIQUE
------------------


1 - Mise en place de l'environnemant de travail


Nous avons eu un peu de mal au départ à appréhender
le fonctionnement des outils Node.js, Npm et Cordova.
Même si une fois pris en main, son utilisation est 
relativement simple.

Nous avons été dans l'impossibilité d'installer les
outils nécessaire à notre projet sur les ordinateurs
du M5. Il nous a également été impossible de travailler
avec Npm sur le réseau de la Fac.



2 - Mise en place de l'environnement de test

Une fois l'application lancée, pour appréhender son
fonctionnement, mais aussi pour permettre au responsable
du projet pour le Hubhouse (Monsieur Lanselle) de comprendre
comment modifier des balises ou autres, Nous avons mis en
place une base de donnée Postgres, Nous avons compris et 
lancée le serveur de l'application.

Nous avons reçu dans cette tache le soutien de Adrien Agez,
M2 e-services, qui nous a beaucoup aidé dans cette mise 
en place.


3 -  Intégration du nouveau graphisme

    a) architecture single page app

Notre grand challenge était de comprendre le fonctionnement
d'une architecture single app, mais plus encore, d'y effectuer
des modifications. De comprendre, quels sont le critères qui 
influencent les transitions d'une vue à une autre.


    b) premiere approche de l'intégration des vues

Notre premiere approche de l'intégration des vues à consisté 
à creer plusieurs pages correspondant aux vues qui nous 
avaient été demandé, puis, une fois qu'elles sont faites,
les intégrer au nouveau graphisme.

Si la construction des page a été facile, leur intégration, demandait
beaucoup de temps, et les différents éléments de Css relatifs à une vue
en particulier n'étaient pas clairs.

Ces fichiers de départ se trouvent dans de dossier "views" du 
dépôt.


    c) seconde approche de l'intégration des vues


Notre recherche d'outils et de méthodes pour nous faciliter l'intégration
des différents éléments de ce graphisme, mais aussi faciliter toute 
nouvelle intégration future d'un nouveau graphisme, ou de nouvelle pages
nous a mené à l'atomic design (voir rapport).

Les fichiers se trouvent dans le dossier "design",
dans les répertoires "atoms", "molecule", "organism", "templates", "pages".

Cette approche nous a permis de ajouter et déplacer plus facilement
les éléments de design de notre vue.

    Pour mieux apprehender les benefices de ce design, 
il faut aller dans le dossier : 

"design/templates/accueil"

et ouvrir dans un navigateur les trois fichiers suivant:

"accueil.html" , "test.html", "winter.html"


ou dans "design/templates/conditions"

ouvrir : "conditions.html", "test.html", "spring.html"
