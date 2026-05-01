/* auteur: Bernard Martin-Rabaud */
/* date de creation: 30/01/01 */

// *****************************************************
// JEU DU PENDU : LE JEU LUI-MEME
// *****************************************************


// *****************************************************
// SOMMAIRE GENERAL (1557, 935)
// [le 1 premier fichier est modifiable, mais pas les autres; il est possible de le générer par formulaire]
// - LES PARAMETRES ET DONNEES (dans fichier pendu_donnees.js) : VOS THEMES ET MOTS A DEVINER (133, 100)
// - CLASSE ET METHODES "ALPHABET" (pendu_alpha.js) : L'ALPHABET (94, 53)
// - CLASSE ET METHODES "MOT" (pendu_mot.js) : LE MOT A DEVINER (252, 168)
// - CLASSE ET METHODES "LETTRE" (pendu_lettres.js) : LES LETTRES DE L'ALPHABET ET DU MOT (211, 131)
// - CLASSE ET METHODES "POLICE" (pendu_police.js) : LA GESTION DES POLICES (67, 26)
// - CLASSE ET METHODES "IMAGE" (pendu_image.js) : L'IMAGE DU PENDU (165, 91)
// - CLASSE ET METHODES "SCORE" (pendu_score.js) : LE SCORE (158, 99)
// - CLASSE ET METHODES "THEMES" (pendu_theme.js) : LES THEMES DISPONIBLES (186, 118)
// - CLASSE ET METHODES "COMMENTAIRES" (pendu_comments.js) : LES COMMENTAIRES SELON LE NOMBR DE FAUTES (60, 24)
// - CLASSE ET METHODES "JEU" (ce fichier : pendu_jeu.js) : LE JEU (231, 125)
//   entre () : lignes de code avec commentaires, lignes de code sans commentaires
// POIDS DU SCRIPT :
//   avec commentaires : 60018 octets (38.5 octets / lignes)
//   sans commentaires : 30144 octets (32.2 octets / ligne, 50% poids avec commentaires)
//   67 % de lignes de commentaires par rapport au code pur
// *****************************************************


// *****************************************************
// VARIABLES GLOBALES
var polices = null;
var alphabet = null;
var jeu = null;
var texte = null;
var liste = null;
var image = null;
var score = null;
// *****************************************************

// *****************************************************
// PRINCIPE DE FONCTIONNEMENT DU SCRIPT

// A la base une application interactive réagit à des événements. 
// Ce script commence à afficher le jeu dans la page HTML, 
// puis le jeu est dirigé par les actions déclenchées par le joueur.
// Le script est constitué d'un certain nombre d'objets spécialisés
// (image du pendu, lettres, mot à deviner, alphabet, thèmes, aide, affichage du score)
// dont chacun a sa propre logique et son propre comportement. 
// Le script fonctionne par va-et-vient constants entre ces objets
// et les fonctions principales (ci-dessous) qui correspondent
// aux principales actions du joueur. En fait, les objets ont pour fonction
// d'assister le script principal (le jeu) dans des tâches spécialisées.
// Ils offrent également l'avantage de pouvoir modifier des comportements
// sans toucher aux autres objets non concernés et surtout au script principal.
// *****************************************************

// *****************************************************
// JEU : VERSION DE BASE

// création des objets principaux et champs de CJeu qui servent de variables globales
function CJeu() {
   alphabet = new CAlphabet();
   liste = new CListeThemes();
   image = new CDessinPendu();
   donnees();
   texte = new CATrouver();
   score = new CScore();
   this.fin_mot = false;
   this.erreurs = 6;
}

// METHODES DE LA CLASSE CJEU
// - init : écrit, initialise et affiche les objets du jeu (au départ du jeu)
// - rejouer : réinitialise et affiche ces objets
// - aide : affiche l'aide lorsqu'on clique sur "aide"
// - prec et suiv : lorsqu'on clique sur "mot prec" et "mot suiv"
// - terminer : lorsqu'un mot est terminé (par un succès ou un échec)*
// - choix_lettre : lorsqu'on choisit une lettre de l'alphabet
// - change_theme : lorsqu'on sélectionne un thème

// écriture du bouton "rejouer"
function CJ_ecrit_rejouer() {
   return "<a href='javascript:jeu.rejouer()'><img name='rejouer' src='" + _rep_images + bouton_vide + "' width='102' height='26' border='0' alt='rejouer'" + fin_tag + "</a>";
}

// démarre le jeu à l'ouverture de la page :
// - écrit les éléments du jeu dans la page "pendu.htm"
// - puis soit attend le choix d'un thème, soit donne un mot au hasard, s'il y a un seul thème 
function CJ_demarrer() {
   score.init();
   this.ecrit();
   if (liste.themes.length == 1) liste.choix_mot();
//   alphabet.reinit();
}

// écriture des objets principaux dans la page "pendu.htm" ;
// le tout est inscrit dans un tableau de largeur 780 (pour être visible dans une page 800x600)
// à 3 lignes et 2 colonnes :
// 1ère ligne : le logo et le titre (1 colonne chacun)
// 2ème ligne : une courte présentation-explication (sur 2 colonnes)
// 3ème ligne : 1 colonne pour le dessin du pendu et 1 colonne pour le mot, l'alphabet et le score
function CJ_ecrit() {
   // écriture du tableau
   var ch = "<table width='100%' border='0' cellspacing='0' cellpadding='8' >\n";
   // écriture de la liste des thèmes
   ch += "<tr><td>" + liste.ecrit() + "Sélectionnez un thème</tr>\n";
   // écriture de l'alphabet
   ch += "<tr><td align='center'>" + alphabet.ecrit() + "</td></tr>\n";
   // emplacement du bouton "rejouer"
   ch += "<tr><td align='right'>" + this.ecrit_rejouer() + "</td></tr>\n";
   // écriture des cases du texte à deviner (seulement les cases)
   ch += "<tr><td align='center'>" + texte.ecrit() + "</td></tr>\n";
   // écriture du tableau des scores
   ch += "<tr><td align='center'>" + score.ecrit() + "</td></tr>\n"; 
   ch += "</table>"; 
   document.write(ch);
}

// termine le jeu en cours lorsque le joueur a trouvé ou s'il a fait 6 erreurs
// si "reussite" est vrai le jeu se termine avec succés,
// sinon par un échec;
// le score est mis à jour
function CJ_termine(erreur) {
   this.fin_mot = true;
   liste.mot_termine();
   if (erreur == this.erreurs) {
      texte.affiche_fin();
	  image.fin();
	  score.maj(false);
   }
   else score.maj(true);
   this.affiche_rejouer();
   alphabet.cache();
   window.focus();
   commentaire(erreur);
//   LComments[erreur].choix_lib();
}

// action déclenchée lorsque l'utilisateur clique sur le bouton "rejouer"
// seulement lorsqu'on a fini le mot
function CJ_rejouer() {
   image.reinit();
   if (this.fin_mot) liste.choix_mot();
   this.fin_mot = false;
   this.cache_rejouer();
   alphabet.reinit();
}

// affichage du bouton rejouer
function CJ_affiche_rejouer() {
   document.images["rejouer"].src = _rep_images + "bouton_rejouer.gif";
}

// cahe le bouton rejouer
function CJ_cache_rejouer() {
   document.images["rejouer"].src = _rep_images + bouton_vide;
   window.focus();
}

// fonction de rollover sur les lettres de l'alphabet
function CJ_rollover(numlettre, passif) {
   alphabet.rollover(numlettre, passif);
}

// ajoute un élement du dessin du pendu
function CJ_sanctionner() {
   image.ajoute_elt(1);
}

// choix d'une lettre dans l'alphabet
function CJ_choisir(numlettre) {
   var choix_lettre = alphabet.choix_lettre(numlettre);
   if (choix_lettre) texte.choixLettre(choix_lettre);
}

// réagit au clic sur le bouton "extrémités"
function CJ_extremites() {
   texte.extremites(true);
}

// réagit au clic sur le bouton "définition"
function CJ_definition() {
   texte.affiche_def();
}

// réagit au clic sur le bouton "contexte"
function CJ_contexte() {
   texte.affiche_contexte();
}

// déclenché lorsqu'on clique sur un thème dans la liste déroulante des thèmes
function CJ_choix_theme(numtheme) {
   liste.choix_theme(numtheme);
}

CJeu.prototype.ecrit = CJ_ecrit;
CJeu.prototype.demarrer = CJ_demarrer;
CJeu.prototype.termine = CJ_termine;
CJeu.prototype.rejouer = CJ_rejouer;
CJeu.prototype.ecrit_rejouer = CJ_ecrit_rejouer;
CJeu.prototype.affiche_rejouer = CJ_affiche_rejouer;
CJeu.prototype.cache_rejouer = CJ_cache_rejouer;
CJeu.prototype.rollover = CJ_rollover;
CJeu.prototype.choisir = CJ_choisir;
CJeu.prototype.sanctionner = CJ_sanctionner;
CJeu.prototype.extremites = CJ_extremites;
CJeu.prototype.definition = CJ_definition;
CJeu.prototype.contexte = CJ_contexte;
CJeu.prototype.choix_theme = CJ_choix_theme;

// *****************************************************
// FONCTIONS UTILITAIRES


function main() {
   jeu = new CJeu();
   jeu.demarrer();
}


