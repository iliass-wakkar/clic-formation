/* auteur: Bernard Martin-Rabaud */
/* date de creation: 16/02/01 */

// *****************************************************
// JEU DU PENDU : CLASSE DES COMMENTAIRES
// *****************************************************


// *****************************************************
// SOMMAIRE GENERAL
// - PARAMETRES (dans fichier pendu_param.js)
// - VARIABLES GLOBALES
// - CLASSE ET METHODES "ALPHABET" (pendu_alpha.js)
// - CLASSE ET METHODES "MOT" (pendu_mot.js)
// - CLASSE ET METHODES "LETTRE" (ce fichier)
// - CLASSE ET METHODES "IMAGE" (pendu_image.js)
// - CLASSE ET METHODES "SCORE" (pendu_score.js)
// - CLASSE ET METHODES "AIDE" (pendu_aide.js)
// - CLASSE ET METHODES "JEU" (pendu_jeu.js)
// *****************************************************

// *****************************************************
// VARIABLES GLOBALES
var LComments = new Array();
// *****************************************************


// *****************************************************
// CLASSE DES COMMENTAIRES EN FONCTION DU RESULTAT DU JEU

function CComment(args) {
   // liste des libellés corrsespondant au niveau d'erreur
   this.libs = new Array(args.length);
   for (var i=0;i<args.length;i++) this.libs[i] = args[i];
}

function CCm_choix_lib(erreur) {
   var n = Math.round(Math.random() * this.libs.length);
//   alert("erreurs = " + erreur + ", num commentaire = " + n + "\n" + this.libs[n]);
   alert(this.libs[n]);
}

CComment.prototype.choix_lib = CCm_choix_lib;

function comment() {
   LComments[LComments.length] = new CComment(arguments);
}

function commentaire(erreur) {
   LComments[erreur].choix_lib(erreur);
}

// 0 faute
comment("0 faute ! Bravissimo !", "Réussi du premier coup!", "Gênial ! 0 faute !", "0 faute ! Excellent !", "Un sans faute ! La classe, quoi !", "Su-per ! Sans aucune faute !");
// 1 faute
comment("Une erreur : pas mal, hein ?", "Un seule erreur !", "Très bon : une faute seulement", "Presqu'un sans faute !", "Juste une erreur : pas loin d'être parfait !", "Une petite faute : Bravo !");
// 2 fautes
comment("Pas si mal (2 erreurs)", "2 erreurs, c'est bon", "2 erreurs seulement", "Juste 2 erreurs. Encourageant !", "2 erreurs, c'est pas grand chose", "2 petites erreurs, c'est rien !"); 
// 3 fautes
comment("3 erreurs !", "3 erreurs, c'est pas si mal.", "3 erreurs : dans la bonne moyenne.", "3 erreurs : peut mieux faire !", "Pas mauvais : 3 erreurs", "3 erreurs : ça va !");
// 4 fautes
comment("4 erreurs; vous vous débrouillez assez bien", "Attention, 2 erreurs de plus et c'était la corde !", "4 erreurs : c'était difficile ?", "4 erreurs : pas facile, hein ?", "4 erreurs !");
// 5 fautes
comment("5 erreurs. Oups, vous l'avez échappé belle !", "5 erreurs : vous n'êtes pas passé loin de la corde !", "5 erreurs : le chanvre a dû vous chatouiler le cou...", "Vous avez eu chaud : 5 erreurs", "Il était temps, une erreur de plus et c'était la corde !", "Quelle veine ! vous avez sauvé votre tête à une erreur près !");
// 6 fautes
comment("Vous êtes pendu !", "Perdu. Couic !", "Dommage, vous avez perdu...", "Perdu ! On vous aimait bien, pourtant !", "Perdu et pendu haut et court !", "Pas de chance ! Perdu !");   
