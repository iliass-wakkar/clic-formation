/* auteur: Bernard Martin-Rabaud */
/* date de creation: 30/01/01 */

// *****************************************************
// JEU DU PENDU : CLASSE DE L'ALPHABET
// *****************************************************


// *****************************************************
// SOMMAIRE GENERAL
// - PARAMETRES (dans fichier pendu_param.js)
// - VARIABLES GLOBALES
// - CLASSE ET METHODES "ALPHABET" (ce fichier : pendu_alpha.js)
// - CLASSE ET METHODES "MOT" (pendu_mot.js)
// - CLASSE ET METHODES "LETTRE" (pendu_lettres.js)
// - CLASSE ET METHODES "IMAGE" (pendu_image.js)
// - CLASSE ET METHODES "SCORE" (pendu_score.js)
// - CLASSE ET METHODES "AIDE" (pendu_aide.js)
// - CLASSE ET METHODES "JEU" (pendu_jeu.js)


// *****************************************************
// VARIABLES GLOBALES
// *****************************************************


// *****************************************************
// CLASSE ALPHABET
// L'alphabet est un tableau d'objets lettre

function CAlphabet() {
   this.longueur = _alphabet.length;
   this.lettres = new Array(this.longueur);
   var i = 0;
   for (i=0;i<this.longueur;i++) {
      this.lettres[i] = new CLettre(i);
      this.lettres[i].init(_alphabet.charAt(i), 0, 0);
   }
}

// modifie l'état des lettres de l'alphabet en fonction des lettres trouvées
// de la partie en cours dans le texte à deviner
function CAlpha_reinit() {
   var i = 0;
   for (i=0;i<_alphabet.length;i++) {
      this.lettres[i].change_etat(0);
	  this.lettres[i].affiche();
   }
}

// écrit l'alphabet dans la page "pendu.htm" 
function CAlpha_ecrit() {
   var ch = "";
   for (i=0;i<this.longueur;i++) ch += this.lettres[i].ecrit();
   return ch;
}

// cache l'alphabet (lorsque le texte à deviner est terminé)
function CAlpha_cache() {
   var i = 0;
   for (i=0;i<this.longueur;i++) this.lettres[i].desactive();
}

// fonction de rollover sur une lettre de l'alphabet
function CAlpha_rollover(lettre, passif) {
   this.lettres[lettre].rollover(passif);
}

// choix d'une lettre de l'alphabet
function CAlpha_choix_lettre(lettre) {
   return this.lettres[lettre].choix();
}

// estompe une lettre de l'alphabet, dont on ne connaît que la valeur
function CAlpha_estompe(valeur) {
   var i = 0;
   while (i < this.longueur) {
      if (this.lettres[i].val == valeur) break;
	  else i++;
   }
   this.lettres[i].choix();
}

CAlphabet.prototype.ecrit = CAlpha_ecrit;
CAlphabet.prototype.reinit = CAlpha_reinit;
CAlphabet.prototype.cache = CAlpha_cache;
CAlphabet.prototype.rollover = CAlpha_rollover;
CAlphabet.prototype.choix_lettre = CAlpha_choix_lettre;
CAlphabet.prototype.estompe = CAlpha_estompe;
// FIN DU TABLEAU "ALPHABET"
// *****************************************************
