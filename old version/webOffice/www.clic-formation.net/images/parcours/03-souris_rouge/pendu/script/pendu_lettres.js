/* auteur: Bernard Martin-Rabaud */
/* date de creation: 30/01/01 */

// *****************************************************
// JEU DU PENDU : CLASSE DES LETTRES
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
// codes des fichiers images
// pour rendre éventuellement les fins de tag (<IMG> en particulier) compatibles XHTML
var fin_tag = _XHTML ? " />" : ">"; 
// idem pour la balise <BR>
var BR = _XHTML ? "<br />" : "<br>"; 
// alphabets de base : 69 caractères
var alphamaj = "0123456789AÁÀÂÄÃÅÆBCÇDEÉÈÊËFGHIÍÌÎÏJKLMNÑOÓÒÔÖØPQRSßTUÚÙÛÜVWXYÝZÐÞ-' %"; 
var alphamin = "0123456789aáàâäãåæbcçdeéèêëfghiíìîïjklmnñoóòôöøpqrsßtuúùûüvwxyýzðþ-' %"; 
var alphabase = "0123456789AAAAAAAABCCDEEEEEFGHIIIIIJKLMNÑOOOOOOPQRSßTUUUUUVWXYYZÐÞ-' %";
// format de fichier des lettres
var format_lettre = ".gif";
// nom des boutons vides (transparents permettant de cacher les boutons réels)
var bouton_vide = "bouton_vide.gif"; 
// dimensions des lettres de la police utilisée pour l'alphabet
var larg_alpha = 16;
var haut_alpha = 16;
// dimensions des lettres de la police utilisée pour le mot
var larg_mot = 17;
var haut_mot = 22;
// dimensions des lettres de la police utilisée pour le score
var larg_score = 11;
var haut_score = 15;
// *****************************************************


// *****************************************************
// CLASSE DES LETTRES

// constructeur de la classe des lettres
// - "val" est la valeur de la lettre ("A" ou "B"....)
// - "trouve" permet de savoir si la lettre est dans état initial ou si elle a été trouvée ou non
//   dans l'état initial : elle n'est pas affichée, trouvée : elle est affichée avec une couleur,
//   non trouvée : elle est affichée d'une autre couleur
function CLettre(num) {
   // numéro de la lettre dans le tableau de lettres qui la contient
   this.num = num; 
   // 0 si la lettre est dans l'alphabet, 1 si elle est dans le mot à trouver ou 2 dans le score
   this.type = -1; 
   // la valeur de la lettre
   this.val = ""; 
   // = 0 : lettre à l'état initial, 
   // = 1 : non trouvée (dans le mot) ou onmouseover (dans l'alphabet)
   // = 2 : estompée (dans le mot ou dans l'alphabet), 
   // = 3 : inactive, si estompée mais dans une partie inactive du mot (mot composé de plusieurs mots) ou effacée (alphabet)
   // les lettres du score n'ont que l'état 0
   this.etat = 0; 
   // un tableau d'images correspondant aux différents états de la lettre
   this.imgs = new Array();
}

// écrit dans la page pendu.htm une lettre selon le type de lettre (alphabet ou mot à trouver)
function CL_ecrit() {
   var ch = "";
   switch (this.type) {
     // lettre de l'alphabet
      case 0 : ch = "<a href='javascript:jeu.choisir(" + this.num + ")' onMouseover='jeu.rollover(" + this.num + ", 0)' onMouseout='jeu.rollover(" + this.num + ", 1)'>";
	           ch += "<img name='alpha" + this.num + "' src='" + this.imgs[0].src + "' border='0' width='" + larg_alpha + "' height='" + haut_alpha + "' alt='" + this.val + "'" + fin_tag;
	           ch += "</a>";
			   break;
      // lettre du texte à deviner (en blanc au départ)
      case 1 : ch = "<img name='mot" + this.num + "' src='" + this.imgs[3].src + "' border='0' width='" + larg_mot + "' height='" + haut_mot + "'" + fin_tag;
               break;
      // lettre du score
	  case 2 : ch = "<img name='score" + this.num + "' src='" + this.imgs[0].src + "' border='0' width='" + larg_score + "' height='" + haut_score + "'" + fin_tag;
   } 
   return ch;        
}

// affiche une lettre en fonction de son type, son état et sa valeur
function CL_affiche() {
   switch (this.type) {
      case 0 : document.images["alpha" + this.num].src = this.imgs[this.etat].src;
	           break;
      case 1 : if (this.etat >= 2) document.images["mot" + this.num].src = this.imgs[this.etat].src;
	           else document.images["mot" + this.num].src = this.code_fichier();
	           break;
      case 2 : document.images["score" + this.num].src = this.code_fichier();
   }
}

// dans le cas de l'alphabet cache les lettres
// et dans le cas du mot l'estompe
function CL_desactive() {
   if (this.type == 0) {
      this.etat = 3;
	  document.images["alpha" + this.num].src = this.imgs[3].src;
   }
}

// modifie l'état de la lettre s'il est dans l'état1 et le passe dans l'état2,
// puis affiche la lettre 
function CL_modifie_si(etat1, etat2) {
   if (this.etat == etat1) {
      this.etat = etat2;
      this.affiche();
   }
}   

// choix d'une lettre de l'alphabet
function CL_choix() {
   this.etat = 2;
   this.affiche();
   return this.val;
}

// le rollover ne concerne que les lettres de l'alphabet;
// lorsque la souris passe sur la lettre (passif = 0) : le source de l'image est en "*01.gif"
// lorsqu'elle quitte la lettre, on réattribue le source d'origine soit "*00.gif";
// si l'état est > 1 (lettre estompée), le rollover est inactif
function CL_rollover(passif) {
   if (this.etat < 2) {
      if (passif) this.etat = 0;
      else this.etat = 1;
      document.images["alpha" + this.num].src = this.imgs[this.etat].src;
   }
}   

// retourne le nom d'un fichier image en fonction de la valeur, de l'état et du type de lettre;
// chaque fichier image de lettre est codé : code-police + type + état + numéro de la lettre (sur 2 chiffres) :
// exemple : la lettre "A" du type alphabet, dans l'état 0, dans la police "Arial" est nommée "a0010.gif"
//           la même lettre du type mot, dans l'état 1, dans la police "Comic" est nommée "k1110.gif"
function CL_code_fichier() {
   var numlettre = alphamaj.indexOf(this.val);
   if (numlettre == -1) numlettre = alphamin.indexOf(this.val);
   var code_police = (this.type) ? "a" : "b";
   return _rep_lettres + code_police + this.type + this.etat + ((numlettre < 10) ? "0" : "") + numlettre + format_lettre;
}

// crée le champ this.imgs (tableau d'images) et y affecte les images
function CL_cree_imgs() {
   var numlettre = alphamaj.indexOf(this.val);
   if (numlettre == -1) numlettre = alphamin.indexOf(this.val);
   var etat = 0;
   switch (this.type) {
      // lettres de l'alphabet
      case 0 : for (etat=0;etat<3;etat++) { 
	              this.imgs[etat] = new Image();
			      this.imgs[etat].src = _rep_lettres + "b0" + etat + ((numlettre < 10) ? "0" : "") + numlettre + format_lettre;
               }
	           this.imgs[3] = new Image();
			   this.imgs[3].src = _rep_lettres + "b0068" + format_lettre;
			   break;
	  // lettres du mot à deviner
      case 1 : for (etat=0;etat<4;etat++) { 
	              this.imgs[etat] = new Image();
				  if (etat == 2) this.imgs[etat].src = _rep_lettres + "a1098" + format_lettre;
				  else if (etat == 3) this.imgs[etat].src = _rep_lettres + "a1068" + format_lettre;
               }
			   break;
	  // lettres du score
      case 2 : this.imgs[0] = new Image();
			   this.imgs[0].src = _rep_lettres + "a0068" + format_lettre;
   }
}			   
			   
// initialise l'état et la valeur d'une lettre
function CL_init(val, type, etat) {
   this.type = type;
   this.val = val;
   this.etat = etat;
   this.cree_imgs();
}

// change l'état et la valeur d'une lettre
function CL_change(etat, val) {
   this.etat = etat;
   this.val = val;
}

// change l'état d'une lettre
function CL_change_etat(etat) {
   this.etat = etat;
}

// modifie l'état de la lettre s'il est un état > etat1 et le passe dans l'état2,
function CL_change_etat_si_sup(etat1, etat2) {
   if (this.etat > etat1) this.etat = etat2;
}

// change la valeur de la lettre
function CL_change_val(val) {
   this.val = val;
}

// retourne "vrai" si "lettre" = au champ "val" de la lettre, "faux" sinon
function CL_egale(lettre) {
   return (this.val == lettre);
}

// retourne "vrai" si "lettre_choisie" correspond au champ "val" de la lettre, "faux" sinon
// "lettre_choisie" est une lettre de l'alphabet
// cette façon de faire permet de faire correspondre "E" de l'alphabet à "É" ou "é" du mot à deviner, par exemple
function CL_correspond(lettre_choisie) {
   // on cherche la position de la lettre courante dans l'un des 2 alphabets alphamaj ou alphamin
   var pos = alphamaj.indexOf(this.val);
   if (pos == -1) pos = alphamin.indexOf(this.val);
   // puis on retourne "vrai" si la lettre de alphabase à la position "pos" trouvée est la même que "lettre_choisie"
   return (alphabase.charAt(pos) == lettre_choisie);
} 

CLettre.prototype.ecrit = CL_ecrit;
CLettre.prototype.affiche = CL_affiche;
CLettre.prototype.change = CL_change;
CLettre.prototype.change_etat = CL_change_etat;
CLettre.prototype.change_etat_si_sup = CL_change_etat_si_sup;
CLettre.prototype.change_val = CL_change_val;
CLettre.prototype.desactive = CL_desactive;
CLettre.prototype.modifie_si = CL_modifie_si;
CLettre.prototype.rollover = CL_rollover;
CLettre.prototype.code_fichier = CL_code_fichier;
// CLettre.prototype.code_special = CL_code_special;
CLettre.prototype.egale = CL_egale;
CLettre.prototype.correspond = CL_correspond;
CLettre.prototype.cree_imgs = CL_cree_imgs;
CLettre.prototype.init = CL_init;
CLettre.prototype.choix = CL_choix;
// FIN DE LA CLASSE DES LETTRES
// *****************************************************
