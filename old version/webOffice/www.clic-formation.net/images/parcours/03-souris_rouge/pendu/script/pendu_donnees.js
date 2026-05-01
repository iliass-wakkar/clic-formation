/* auteur: Bernard Martin-Rabaud */
/* date de creation: 31/01/01 */

// *****************************************************
// JEU DU PENDU : PARAMETRES ET DONNEES
// *****************************************************

// *****************************************************
// PARAMETRES
// alphabet utilisé
var _alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// "true" si on affiche la première et la dernière lettre du mot pour aider le joueur, "false" si on ne le fait pas
var _affiche_debut_fin = false;
// "true" si cet affichage se fait automatiquement, 
// "false" si cet affichage est fait seulement à la demande (avec un bouton : coût x erreurs - voir le paramètre _cout_aide)
// (dans le cas où "affiche_debut_fin = false", ce paramètre n'est pas pris en compte)
var _auto_debut_fin = false;
// coût d'une aide en erreur(s) : 2 signifie qu'une demande d'aide ajoutera 2 éléments du pendu d'un coup
var _cout_aide = 2;
// définition des sous-répertoires
var _rep_images = "images/";
var _rep_lettres = "lettres/";
// indique si les mots sont codés
var _coder = false;
// "true" si les mots à deviner et les indices sont codés dans le fichier pendu_donnees.js, "false" sinon
var _XHTML = false; // "true" si la page est un document XHTML, "false" si c'est un document HTML (par défault)
// FIN DES PARAMETRES
// *****************************************************

// *****************************************************
// VOS DONNEES

function donnees() {
// *****************************************************
// MOTS A RECHERCHER
// - en premier le titre ou le thème : theme()
// - puis la liste des mots : mot()
// Si les mots contiennent des caractères accentués, 
// ces caractères seront transformés en caractères non accentués.
// 


theme("La souris");
mot("La molette//Sert à faire défiler les pages sans utiliser les barres de défilement");
mot("Double-cliquer//Effectuer deux clics rapprochés");
mot("Souris optiques//Déterminent le mouvement par analyse de la surface sur laquelle elles glissent");
mot("Le pointeur//Se déplace sur l'écran lorsque l'on fait glisser la souris//Change de forme selon l'endroit où il est placé");
mot("Cliquer-glisser//Maintenir un des boutons de la souris appuyé, déplacer, relacher");
mot("Menu contextuel//Permet d'accéder rapidement à des commandes se rapportant à l'objet sur lequel on a cliqué//Un clic-droit le fait apparaitre");
mot("Clic droit//Permet d'obtenir un menu sur un fichier, un dossier, un élément...");
mot("Selectionner//Se dit d'un fichier quand on a cliqué dessus une fois");
mot("Cliquer-déplacer//Technique qui permet de dépplacer rapidement des objets d'un dossier à un autre.");
mot("Souris à boule//Souris dont le curseur se déplace grâce au mouvement d'une boule de plastique.");


pendu("", 140, 362, "penduv20.gif");
pendu("", 106, 79, "penduv21.gif");
pendu("pendu0", 106, 90, "penduv22.gif", "penduv23.gif");
pendu("pendu1", 106, 84, "penduv22.gif", "penduv24.gif", "penduv25.gif", "penduv26.gif");
pendu("pendu2", 106, 109, "penduv22.gif", "penduv27.gif", "penduv28.gif");
}
// FIN DES DONNEES
// *****************************************************
