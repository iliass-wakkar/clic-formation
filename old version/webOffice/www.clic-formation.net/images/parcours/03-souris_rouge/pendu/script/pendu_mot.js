/* auteur: Bernard Martin-Rabaud */
/* date de creation: 30/01/01 */

// *****************************************************
// JEU DU PENDU : CLASSE DES TEXTES A DEVINER
// *****************************************************


// *****************************************************
// SOMMAIRE GENERAL
// - PARAMETRES (dans fichier pendu_param.js)
// - VARIABLES GLOBALES
// - CLASSE ET METHODES "ALPHABET" (pendu_alpha.js)
// - CLASSE ET METHODES "TEXTE" (ce fichier : pendu_mot.js)
// - CLASSE ET METHODES "LETTRE" (pendu_lettres.js)
// - CLASSE ET METHODES "IMAGE" (pendu_image.js)
// - CLASSE ET METHODES "SCORE" (pendu_score.js)
// - CLASSE ET METHODES "AIDE" (pendu_aide.js)
// - CLASSE ET METHODES "JEU" (pendu_jeu.js)
// *****************************************************


// *****************************************************
// VARIABLES GLOBALES
var maxmot = 30;
var en_clair = " -'";
// *****************************************************


// *****************************************************
// CLASSE DES TEXTES A TROUVER
// Il s'agit du texte à deviner (une seule instance de la classe) 

// constructeur de la classe texte : le texte est vide au départ
function CATrouver() {
   // valeur du texte
   this.valeur = new CMot(); 
   // longueur du texte
   this.longueur = 0; 
   // indique le nombre de lettres trouvées
   this.trouvees = 0;
   // tableau des indices des lettres
   this.lettres = new Array(maxmot); 
   var i = 0;
   for (i=0;i<maxmot;i++) {
      this.lettres[i] = new CLettre(i);
	  this.lettres[i].init(" ", 1, 0);
   }
   // 3 booléens indiquant si les extrémités, la définition et/ou le contexte ont é&té demandés
   this.extremes = false;
   this.def = false;
   this.contexte = false;
}

// affiche ou pas les boutons "extrémités", "définition" et "contexte"
// selon les infos du mot
function CAT_init_boutons() {
   if ((_affiche_debut_fin) && (!_auto_debut_fin)) document.images["extremites"].src = _rep_images + "bouton_extremes.gif";
   else document.images["extremites"].src = _rep_images + bouton_vide;
   this.extremes = false;
   if (this.valeur.def) document.images["definition"].src = _rep_images + "bouton_def.gif";
   else document.images["definition"].src = _rep_images + bouton_vide;
   this.def = false;
   if (this.valeur.contexte) document.images["contexte"].src = _rep_images + "bouton_contexte.gif";
   else document.images["contexte"].src = _rep_images + bouton_vide;
   this.contexte = false;
   document.forms["frm"].aide.value = "";
}

// affecte une valeur au texte à trouver, puis l'affiche
function CAT_init(objmot) {
   // remise à 0 de trouvees
   this.trouvees = 0;
   var i = 0;
   // contenu du texte
   this.valeur = objmot; 
   // longueur du texte
   this.longueur = this.valeur.val.length; 
   // initialisation des lettres du texte
   var debut = 0;
   var fin = this.longueur;
   // au cas où les lettres de début et de fin doivent être affichées en clair :
   if (_auto_debut_fin) this.extremites(false);
   for (i=debut;i<fin;i++) {
      // écrit en clair les lettres faisant partie de la chaîne "enclair" (voir en haut)
	  // et incrémente this.trouvees pour chacune d'entre elles  
      if (en_clair.indexOf(this.valeur.val.charAt(i)) != -1) {
	     this.lettres[i].change(0, this.valeur.val.charAt(i));
		 this.trouvees++;
      }
	  // sinon la lettre est masquée
	  else this.lettres[i].change(2, this.valeur.val.charAt(i));
   }
   this.affiche();
   while (i < maxmot) { 
      this.lettres[i].change(0, " ");
      this.lettres[i].affiche();
	  i++;
   }
   this.init_boutons();
}

// affiche le texte lettre par lettre lorsque le mot est terminé
function CAT_affiche_fin() {
   var i = 0;
   for (i=0;i<this.longueur;i++) {
      this.lettres[i].change_etat_si_sup(1, 1);
      this.lettres[i].affiche();
   }
}

// affiche le texte lettre par lettre
function CAT_affiche() {
   var i = 0;
   for (i=0;i<this.longueur;i++) this.lettres[i].affiche();
}

// efface le texte
function CAT_efface() {
   var i = 0;
   for (i=0;i<this.maxmot;i++) {
      this.lettres[i].change(3, " ");
      this.lettres[i].affiche();
   }
}

// recherche si une des autres lettres a la même lettre que la lettre courante
// sinon, la lettre correspondante de l'alphabet doit être estompée
function CAT_verif_autres_lettres(lettre) {
   var i = 1;
   while (i<this.longueur-1) {
      if (this.lettres[lettre].val == this.lettres[i].val) break;
	  else i++;
   }
   var pos = alphamin.indexOf(this.lettres[lettre].val);
   if (pos == -1) pos = alphamaj.indexOf(this.lettres[lettre].val);
   var car = alphabase.charAt(pos);
   if (i == this.longueur-1) alphabet.estompe(car);
}

// affiche les extrémités du mot
// si sanction = vrai, on ajoute des éléments au pendu
function CAT_extremites(sanction) {
   // la méthode est lancée seulement si l'affichage des 1ères et dernières lettres est autorisé
   // et si la demande n'a pas déjà été faite
   if ((_affiche_debut_fin) && (!this.extremes)) {
      // met la 1ère lettre du mot en clair
      this.lettres[0].change_etat(0);
      this.lettres[0].affiche();
      // recherche si une des autres lettres non encore trouvées à la même lettre que la 1ère
      // sinon, la lettre correspondante de l'alphabet doit être estompée
      this.verif_autres_lettres(0);
      // même processus pour la dernière lettre du mot
      this.lettres[this.longueur-1].change_etat(0);
      this.lettres[this.longueur-1].affiche();
      // si les 2 lettres sont les mêmes, il est inutile de faire cette recherche
      if (this.lettres[0].val != this.lettres[this.longueur-1].val) 
         this.verif_autres_lettres(this.longueur-1);
      this.trouvees += 2;
	  this.extremes = true;
      if (sanction) image.ajoute_elt(_cout_aide);
   }
}

// affiche la définition dans le TEXTAREA d'aide
function CAT_affiche_def() {
   // si le mot possède une définition on l'affiche
   if (this.valeur.def) {
      document.forms["frm"].aide.value = this.valeur.def;
	  // si c'est la 1ère fois qu'on utilise la définition, on paye "_cout_aide" erreurs
	  // et on indique qu'on a déjà utilisé la définition 
	  // (à la prochaine utilisation on ne payera plus d'erreurs)
	  // on peut aussi cliquer sur cette aide lorsque le mot est fini (sans ajouter un élément de pendu)
	  if (!((this.def) || (jeu.fin_mot))) {
         image.ajoute_elt(_cout_aide);
         this.def = true;
      }
   }
}

// affiche le contexte dans le TEXTAREA d'aide
function CAT_affiche_contexte() {
   // si le mot possède un contexte on l'affiche
   if (this.valeur.contexte) {
      document.forms["frm"].aide.value = this.valeur.contexte;
	  // si c'est la 1ère fois qu'on utilise le contexte, on paye "_cout_aide" erreurs
	  // et on indique qu'on a déjà utilisé le contexte 
	  // (à la prochaine utilisation on ne payera plus d'erreurs)
	  // on peut aussi cliquer sur cette aide lorsque le mot est fini (sans ajouter un élément de pendu)
	  if (!((this.contexte) || (jeu.fin_mot))) {
         image.ajoute_elt(_cout_aide);
         this.contexte = true;
      }
   }
}

// choix d'une lettre dans l'alphabet et affectation à la lettre ou aux lettres
// correspondantes du texte
// si "trouve" est true, la ou les lettres sont dans l'état "0", sinon (false) dans l'état "2"
function CAT_choixLettre(lettre_choisie) {
   var il = 0;
   var echec = true;
   // vérifie dans toutes les lettres du mot s'il y en a qui correspondent à la lettre choisie
   for (il=0;il<this.longueur;il++) {
      if (this.lettres[il].etat == 2) {
         if (this.lettres[il].correspond(lettre_choisie)) {
	        this.lettres[il].change_etat(0);
            this.lettres[il].affiche();
		    this.trouvees++;
            if (echec) echec = false;
         }
      }
   }
   // en cas d'échec on demande au jeu d'appliquer une sanction !
   // (soit ajouter un élément du pendu, soit terminer le jeu si le pendu est complet)
   if (echec) jeu.sanctionner();
   // sinon, si toutes les lettres sont trouvées, le jeu se termine avec 0 faute
   else if (this.trouvees == this.longueur) jeu.termine(image.erreur);
}

// écriture de l'aide avec les boutons "définition", "contexte" et "extrémités"
function CAT_ecrit_aide_vide() {
   var ch = "<table border='0'>";
   ch += "<tr>";
   ch += "<tr><td><a href='javascript:jeu.definition()'><img name='definition' src='" + _rep_images + bouton_vide + "' width='102' height='26' border='0'" + fin_tag + "</a></td>";
   ch += "<td><a href='javascript:jeu.contexte()'><img name='contexte' src='" + _rep_images + bouton_vide + "' width='102' height='26' border='0'" + fin_tag + "</a></td>";
   ch += "<td><a href='javascript:jeu.extremites()'><img name='extremites' src='" + _rep_images + bouton_vide + "' width='102' height='26' border='0'" + fin_tag + "</a></td></tr>";
   if (navigator.appName == "Microsoft Internet Explorer") 
      ch += "<tr><td class='info1' colspan='4'><textarea name='aide' cols='55' rows='2' wrap='virtual'> </textarea>";
   else
      ch += "<tr><td class='info1' colspan='4'><textarea name='aide' cols='40' rows='2' wrap='virtual'> </textarea>";
   ch += BR + "Toute demande d'aide vous sera comptée " + _cout_aide + ((_cout_aide <2) ? " erreur" : " erreurs") + "</td></tr>";
   ch += "</table>\n";
   return ch;
}
   
// écrit toutes les lettres du texte en blanc (au début),
// c'est-à-dire les _maxmot lettres
function CAT_ecrit() {
   var ch = "";
   var il = 0;
   // écrit toutes les lettres
   for (il=0;il<maxmot;il++) {
      ch += this.lettres[il].ecrit();
   }
   ch += BR + "\n";
   ch += this.ecrit_aide_vide();
   return ch;
}   

CATrouver.prototype.init = CAT_init;
CATrouver.prototype.init_boutons = CAT_init_boutons;
CATrouver.prototype.affiche = CAT_affiche;
CATrouver.prototype.efface = CAT_efface;
CATrouver.prototype.affiche_fin = CAT_affiche_fin;
CATrouver.prototype.choixLettre = CAT_choixLettre;
CATrouver.prototype.ecrit = CAT_ecrit;
CATrouver.prototype.ecrit_aide_vide = CAT_ecrit_aide_vide;
CATrouver.prototype.extremites = CAT_extremites;
CATrouver.prototype.verif_autres_lettres = CAT_verif_autres_lettres;
CATrouver.prototype.affiche_def = CAT_affiche_def;
CATrouver.prototype.affiche_contexte = CAT_affiche_contexte;
// FIN DE LA CLASSE DES TEXTES
// *****************************************************

