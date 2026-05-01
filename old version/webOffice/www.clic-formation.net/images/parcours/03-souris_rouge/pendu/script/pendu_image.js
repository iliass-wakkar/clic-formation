/* auteur: Bernard Martin-Rabaud */
/* date de creation: 03/02/01 */

// *****************************************************
// JEU DU PENDU : LES IMAGES DU PENDU
// *****************************************************


// *****************************************************
// SOMMAIRE GENERAL (1080, 633)
// [les 2 premiers fichiers sont modifiables, mais pas les autres;
// il est possible de les générer par formulaire]
// - PARAMETRES (dans fichier pendu_param.js) : PERMETTENT DE PARAMETRER LE SCRIPT (123, 31)
// - LES DONNEES (dans fichier pendu_donnees.js) : VOS THEMES ET MOTS A DEVINER (85, 54)
// - VARIABLES GLOBALES
// - CLASSE ET METHODES "ALPHABET" (pendu_alpha.js) : L'ALPHABET (52, 20)
// - CLASSE ET METHODES "MOT" (pendu_mot.js) : LE MOT A DEVINER (169, 115)
// - CLASSE ET METHODES "LETTRE" (pendu_lettres.js) : LES LETTRES DE L'ALPHABET ET DU MOT (245, 170)
// - CLASSE ET METHODES "IMAGE" (pendu_image.js) : L'IMAGE DU PENDU
// - CLASSE ET METHODES "SCORE" (pendu_score.js) : LE SCORE (146, 90)
// - CLASSE ET METHODES "THEMES" (pendu_theme.js) : LES THEMES DISPONIBLES (118, 77)
// - CLASSE ET METHODES "JEU" (ce fichier : pendu_jeu.js) : LE JEU (142, 76)
//   entre () : lignes de code avec commentaires, lignes de code sans commentaires
// *****************************************************


// *****************************************************
// VARIABLES GLOBALES
// liste des images
var LImgs = new Array();

// *****************************************************
// CLASSES DES CASES DU DESSIN DU PENDU

// Une case est un élément du dessin dans laquelle vient se placer
// une ou plusieurs images, parties du dessin du pendu.
// Ce constructeur de la classe des cases comprend au minimum 3 arguments :
// - la largeur de la case,
// - sa hauteur,
// - l'image de départ qui sera affichée à l'ouverture de la page,
// et les autres images qui peuvent prendre la place de l'image de départ.
// Ces autres images sont les éléments du pendu : tête, tronc, bras, jambes, pieds...
function CCase(nom, larg, haut, img1, nbimgs) {
   // nom de l'image dans la page (correspond au contenu de "name" dans <img name="...")
   this.nom = nom;
   // largeur des images de la case
   this.larg = larg; 
   // hauteur des images de la case
   this.haut = haut; 
   // indice de la 1ère image dans LImages
   this.img1 = img1; 
   // nombre d'images dans la case
   this.nbimgs = nbimgs; 
   // l'image en cours affichée dans la case (1ère image par défaut)
   this.imgcour = 0; 
}

// initialise une case :
// - efface l'élément variable s'il y en a un
// - met imgcour à 0
function CC_init() {
   if (this.nbimgs > 1) {
      document.images[this.nom].src = LImgs[this.img1].src;
      this.imgcour = 0;
   }
}

// change l'image de la case
function CC_change() {
   this.imgcour++;
   document.images[this.nom].src = LImgs[eval(this.img1 + this.imgcour)].src;
}

CCase.prototype.init = CC_init;
CCase.prototype.change = CC_change;

   

// CLASSE GENERALE DU PENDU

function CDessinPendu() {
   // liste des cases du dessin
   this.cases = new Array(); 
   // nombre d'erreurs en cours
   this.erreur = 0; 
}

// écrit dans la page HTML le dessin du pendu
function CDP_ecrit() {
   var ch = "<table border='1' cellpadding='0' cellspacing='0' width='250'><tr><td>";
   ch += "<table width='246' height='362' cellpadding='0' cellspacing='0' border='0'><tr>";
   ch += "<td rowspan='5'><img src='" + _rep_images + "penduv20.gif' border='0' width='140' height='362'></td>";
   ch += "<td><img src='" + _rep_images + "penduv21.gif' border='0' width='106' height='79'></td></tr>";
   ch += "<tr><td><img name='pendu0' src='" + _rep_images + "penduv22.gif' border='0' width='106' height='90'></a></td></tr>";
   ch += "<tr><td><img name='pendu1' src='" + _rep_images + "penduv22.gif' border='0' width='106' height='84'></a></td></tr>";
   ch += "<tr><td><img name='pendu2' src='" + _rep_images + "penduv22.gif' border='0' width='106' height='109'></a></td></tr>";
   ch += "</table></td></tr></table>";
   return ch;
}

// réinitialise le dessin du pendu lorsqu'on clique sur "rejouer":
// - efface les éléments variables
// - met les champs imgcour à 0 ainsi que le nombre d'erreurs
function CDP_reinit() {
   var i = 0;
   for (i=0;i<this.cases.length;i++) this.cases[i].init();
   this.erreur = 0;
}
    
// ajoute n éléments au pendu
function CDP_ajoute_elt(n) {
   var i = 0;
   var elt = 0;
   while (n--) {
      // l'erreur est incrémentée
      this.erreur++; 
      // si le nombre d'erreurs = le nombre d'essais, le jeu se termine sur un échec
      if (this.erreur == jeu.erreurs) {
         jeu.termine(this.erreur);
	     return;
      }
      // on ajoute le xème élément, x correspond au numéro d'erreur dans le champ "erreur"
      // il faut chercher le xème élément variable dans les cases
      i = 0;
      elt = 0;
      // on recherche la case contenant l'élément qui sera modifié
      while (i < this.cases.length) {
         // si la case contient plus d'1 image elle peut être candidate
         if (this.cases[i].nbimgs > 1) { 
            elt += this.cases[i].nbimgs - 1;
	        if (this.erreur <= elt) break;
            else i++;
         }
	     // si la case ne contient qu'1 image on passe à la suivante
	     else i++;
      }
      this.cases[i].change();
   }
}

// affiche la dernière image (si l'homme est pendu)
function CDP_fin() {
   this.cases[this.cases.length-1].change();
}

// fonction de création de la liste des images et des cases
function CDP_pendu(args) {
   var numimg = LImgs.length;
   // création d'un objet CCase (largeur, hauteur, indice 1ère image dans LImgs, nombre d'images)
   this.cases[this.cases.length] = new CCase(args[0], args[1], args[2], numimg, args.length - 3);
   // création des éléments de LImgs, qui sont des objets images
   // affectation à cet objet de la largeur, de la hauteur, puis du fichier image;
   // toutes ces images sont liées à l'objet CCase
   var i = 0;
   for (i=3;i<args.length;i++) {
      LImgs[numimg] = new Image(args[1], args[2]);
      LImgs[numimg++].src = _rep_images + args[i];
   }
}

CDessinPendu.prototype.ecrit = CDP_ecrit;
CDessinPendu.prototype.reinit = CDP_reinit;
CDessinPendu.prototype.ajoute_elt = CDP_ajoute_elt;
CDessinPendu.prototype.pendu = CDP_pendu;
CDessinPendu.prototype.fin = CDP_fin;


function pendu() {
   image.pendu(arguments);
}

