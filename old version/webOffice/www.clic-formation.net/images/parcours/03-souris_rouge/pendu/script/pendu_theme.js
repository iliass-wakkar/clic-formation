/* auteur: Bernard Martin-Rabaud */
/* date de creation: 01/02/01 */

// *****************************************************
// JEU DU PENDU : LE JEU LUI-MEME
// *****************************************************


// *****************************************************
// SOMMAIRE GENERAL
// - PARAMETRES (dans fichier pendu_param.js)
// - VARIABLES GLOBALES
// - CLASSE ET METHODES "ALPHABET" (pendu_alpha.js)
// - CLASSE ET METHODES "MOT" (pendu_mot.js)
// - CLASSE ET METHODES "LETTRE" (pendu_lettres.js)
// - CLASSE ET METHODES "IMAGE" (pendu_image.js)
// - CLASSE ET METHODES "SCORE" (pendu_score.js)
// - CLASSE ET METHODES "AIDE" (pendu_aide.js)
// - CLASSE ET METHODES "JEU" (ce fichier : pendu_jeu.js)


// *****************************************************
// VARIABLES GLOBALES
var cars = "0123456789AÀÂÄBCÇDEÉÈÊËFGHIÎÏJKLMNOÔÖPQRSTUÙÛÜVWXYZaàâäbcçdeéèêëfghiîïjklmnoôöpqrstuùûüvwxyz -',/*";
// nombre maximum de mots à deviner par thème
var max_mots = 99; 
// *****************************************************

// *****************************************************
// CLASSES DES MOTS

// constructeur de la classe des mots à deviner :
// - le mot à deviner
// - sa définition (def)
// - son contexte
// - un booléen indiquant si le mot a déjà été joué;
// le mot a en arguments : mot [, def [, contexte]] (def et contexte étant facultatifs)
// ou mot [, contexte]
// les arguments sont reçus sous forme d'une chaîne de caractères :
//   les arguments sont séparés par des "#",
//   les arguments peuvent être codés, et il faut d'abord les décoder
function CMot() {
   // libellé du mot
   this.val = "";
   // définition du mot (affichable à la demande par le joueur)
   this.def = "";
      // contexte dans lequel le mot est utilisé (affichable à la demande par le joueur)
   this.contexte = ""; 
   // "vrai" si le mot a déjà été deviné
   this.fait = false; 
   if (arguments.length) {
      // traitement de la chaîne d'arguments chargs
      // décodage, si elle est codée
	  var chargs = arguments[0];
      if (_coder) chargs = chargs.decode();
      var args = new Array();
      args = chargs.split("//");
      // contenu d'un mot
      this.val = args[0]; 
      if (args.length > 1) {
         // si le 2ème arguments ne contient pas de "***", c'est une définition
         if (args[1].indexOf("***") == -1) this.def = args[1];
	     // sinon c'est un contexte
	     else this.contexte = args[1];
         if (args.length > 2) this.contexte = args[2];
      }
   }
}
      
// *****************************************************
// CLASSES DES THEMES

function CTheme(titre) {
   // titre du thème
   this.titre = titre; 
   // le nombre de mots correspondants au thème
   this.mots = new Array(); 
   // nombre de mots déjà "faits"
   this.faits = 0; 
   // mot en cours
   this.motcour = -1; 
}

function CTh_choix_mot() {
   if (this.faits == this.mots.length) {
      alert("Vous avez épuisé tous les mots de ce thème !");
	  texte.efface();
   }
   else {
      var alea = Math.floor(Math.random()*this.mots.length);
      while (this.mots[alea].fait) 
         alea = Math.floor(Math.random()*this.mots.length);
	  this.motcour = alea;
	  texte.init(this.mots[alea]);
   }
}

// crée un objet CMot
function CTh_mot(valeur) {
   this.mots[this.mots.length] = new CMot(valeur);
}

CTheme.prototype.choix_mot = CTh_choix_mot;
CTheme.prototype.mot = CTh_mot;

// FIN DE CLASSE DES MOTS ET THEMES
// *****************************************************


// *****************************************************
// CLASSE DE LA LISTE DES THEMES

function CListeThemes() {
   this.themes = new Array();
   this.themecour = -1;
}

// retourne le titre du thème s'il n'y en a qu'un seul
function CLT_titre_theme() {
   if (this.themes.length == 1) return " : " + BR + this.themes[0].titre;
   else return "";
}

function CLT_choix_mot() {
   this.themes[this.themecour].choix_mot();
}
   
// ajoute à liste.themes un nouvel objet CTheme
function CLT_theme(titre) {
   this.themecour = this.themes.length;
   this.themes[this.themecour] = new CTheme(titre);
}

function CLT_mot(valeur) {
   this.themes[this.themecour].mot(valeur);
}

function CLT_mot_termine() {
   this.themes[this.themecour].faits++;
   this.themes[this.themecour].mots[this.themes[this.themecour].motcour].fait = true;
}

// écrit une liste déroulante (SELECT) affichant les thèmes
function CLT_ecrit() {
   var ch = "<select name='liste_themes' size='3' onChange='jeu.choix_theme(this.selectedIndex)'>\n";
   var i = 0;
   for (i=0;i<this.themes.length;i++) 
      ch += "<option value=" + i + ">" + this.themes[i].titre + "</option>\n";
   ch += "</select>";
   return ch;
}

// choisit un thème
function CLT_choix_theme(numtheme) {
   this.themecour = numtheme;
   this.choix_mot();
}

CListeThemes.prototype.theme = CLT_theme;
CListeThemes.prototype.mot = CLT_mot;
CListeThemes.prototype.titre_theme = CLT_titre_theme;
CListeThemes.prototype.choix_mot = CLT_choix_mot;
CListeThemes.prototype.ecrit = CLT_ecrit;
CListeThemes.prototype.choix_theme = CLT_choix_theme;
CListeThemes.prototype.mot_termine = CLT_mot_termine;

// décode une lettre
function decode_lettre(lettre, rotation) {
   var n = cars.indexOf(lettre);
   if (n == -1) return lettre;
   return cars.charAt(eval(n - rotation + ((n >= rotation) ? 0 : cars.length)));
}
   
// décode un texte
function decode() {
   var i = 0;
   var n = ((this.length > cars.length) || (this.length < 3)) ? cars.length : this.length;
   n = (n % 2) ? (n - 1) / 2 : n / 2; 
   var ch = "";
   var car = "";
   for (i=0;i<this.length;i++) ch += decode_lettre(this.charAt(i), n);
   return ch;
} 

String.prototype.decode = decode;


function theme(titre) {
   liste.theme(titre);
}

function mot(valeur) {
   liste.mot(valeur);
}




