/* auteur: Bernard Martin-Rabaud */
/* date de creation: 02/02/01 */

// *****************************************************
// JEU DU PENDU : LE SCORE
// *****************************************************


// *****************************************************
// SOMMAIRE GENERAL
// [les 2 premiers fichiers sont modifiables, mais pas les autres;
// il est possible de les générer par formulaire]
// - PARAMETRES (dans fichier pendu_param.js) : PERMETTENT DE PARAMETRER LE SCRIPT
// - LES DONNEES (dans fichier pendu_donnees.js) : VOS THEMES ET MOTS A DEVINER
// - VARIABLES GLOBALES
// - CLASSE ET METHODES "ALPHABET" (pendu_alpha.js) : L'ALPHABET
// - CLASSE ET METHODES "MOT" (pendu_mot.js) : LE MOT A DEVINER
// - CLASSE ET METHODES "LETTRE" (pendu_lettres.js) : LES LETTRES DE L'ALPHABET ET DU MOT
// - CLASSE ET METHODES "IMAGE" (pendu_image.js) : L'IMAGE DU PENDU
// - CLASSE ET METHODES "SCORE" (ce fichier : pendu_score.js) : LE SCORE
// - CLASSE ET METHODES "AIDE" (pendu_aide.js) : L'AIDE AU JOUEUR
// - CLASSE ET METHODES "THEMES" (pendu_theme.js) : LES THEMES DISPONIBLES
// - CLASSE ET METHODES "JEU" (pendu_jeu.js) : LE JEU
// *****************************************************


// *****************************************************
// UTILITE DE L'OBJET SCORE
//
// Le score affiche 4 informations :
// - le nombre d'essais totaux
// - le nombre de mots trouvés
// - le nombre de mots ratés
// - le % de réussite = nombre de mots trouvés / nombre d'essais totaux
//
// Lorsque le mot est terminé (deviné ou raté), le jeu envoie l'info au
// score qui met à jour ses chiffres et les affiche.
// *****************************************************


// *****************************************************
// CLASSE SCORE

// constructeur de l'objet score : les champs sont initialisés à 0 
function CScore() {
   this.essais = 0;
   this.trouves = 0;
   this.nblettres = Math.ceil(Math.log(max_mots) / Math.LN10);
   // lettres pour écrire les scores
   this.lettres = new Array((this.nblettres + 1) * 3 + 1); 
}

// met à jour les champs "devines" et "essais"
// "resultat" est un booléen ("vrai" / "faux") indique si le joueur a réussi le dernier essai
function CS_maj(resultat) {
   this.essais++;
   if (resultat) this.trouves++;
   this.affiche();
}

// initialise le score : initialise les lettres du score
function CS_init() {
   var i = 0;
   var numlettre = 0;
   var col = 0;
   // initialisation des lettres des essais, des mots trouvés et des mots ratés
   for (col=0;col<3;col++) {
      for (i=0;i<this.nblettres;i++) {
         this.lettres[numlettre] = new CLettre(numlettre);
	     this.lettres[numlettre].init(" ", 2, 0);
	     numlettre++;
      }
   }
   // initialisation des lettres du % de réussite
   i = 0;
   for (i=0;i<4;i++) {
      this.lettres[numlettre] = new CLettre(numlettre);
	  this.lettres[numlettre].init(" ", 2, 0);
	  numlettre++;
   }
}

// écrit le tableau du score avec les images d'en-tête
function CS_entete() {
   var ch = "<caption class='titrescore'>Votre score</caption><tr>";
   ch += "<td class='tetescore'>essais</td><td class='tetescore'>mots corrects</td><td class='tetescore'>mots incorrects</td><td class='tetescore'>% de réussite</td></tr>";
   return ch;
}

// écrit les 4 colonnes du score
function CS_ecrit() {
   var ch = "<table width='100%' border='1'>" + this.entete() + "<tr>";
   var i = 0;
   var col = 0;
   var numlettre = 0;
   for (col=0;col<3;col++) {
      ch += "<td align='center'>";
      for (i=0;i<this.nblettres;i++) {
	     ch += this.lettres[numlettre].ecrit();
		 numlettre++;
      }
	  ch += "</td>";
   }
   ch += "<td align='center'>";
   for (i=0;i<4;i++) {
      ch += this.lettres[numlettre].ecrit();
      numlettre++;
   }
   ch += "</td></tr></td></table>";
   return ch;
}
   
// affiche les scores
function CS_affiche() {
   var i = 0;
   var col = 0;
   var numlettre = 0;
   var ch = "";
   var n = 0;
   for (col=0;col<3;col++) {
      switch (col) {
	     // affichage des essais
	     case 0 : ch = this.essais.toString(); break; 
		 // affichage des mots trouvés
		 case 1 : ch = this.trouves.toString(); break; 
		 // affichage des mots ratés
         case 2 : n = this.essais - this.trouves; 
                  ch = n.toString();
      }
      while (ch.length < this.nblettres) ch = " " + ch;
      for (i=0;i<this.nblettres;i++) {
         this.lettres[numlettre].change_val(ch.charAt(i));
         this.lettres[numlettre].affiche();
         numlettre++;
      }
   }
   // affichage du % de réussite
   var n = Math.round((this.trouves / this.essais) * 100); 
   ch = n.toString();
   while (ch.length < 3) ch = " " + ch;
   for (i=0;i<3;i++) {
      this.lettres[numlettre].change_val(ch.charAt(i));
      this.lettres[numlettre].affiche();
      numlettre++;
   }
   if (!this.lettres[numlettre].egale("%")) {
      this.lettres[numlettre].change_val("%");
      this.lettres[numlettre].affiche();
   }
}
   
CScore.prototype.maj = CS_maj;
CScore.prototype.init = CS_init;
CScore.prototype.entete = CS_entete;
CScore.prototype.ecrit = CS_ecrit;
CScore.prototype.affiche = CS_affiche;
// FIN DE LA CLASSE SCORE
// *****************************************************

