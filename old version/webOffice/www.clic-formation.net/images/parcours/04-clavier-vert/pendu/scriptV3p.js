// ----------------------------------------------
// ImplÃ©mentation de l'algorithme JeuduPendu
// Version : 3
// ----------------------------------------------
$(document).ready(function () {
    // 1. CrÃ©ation des variables exÃ©cutÃ© au chargement de la page
    // --------------------------------------------------------
    // Tableau des mots Ã  chercher (1a)
    var Tmots = ["poisson", "chien", "chat", "souris", "canari", "vache", "veau", "canard", "mouton", "cheval"];
    var motSecret; // Mot cherchÃ© (1b1) (extrait de Tmot[])
    var TReponse = []; // Tableau des lettres de la rÃ©ponse (1c1)
    var nbLettresManquantes; // Nombre de lettres Ã  chercher (1d1)
    var nbErreursEnCours; // Nombre d'erreurs en cours de jeux (rajoutÃ© dans la version V3a)
    var nbErreursmax; // Nombre d'erreurs acceptÃ©es (1f1)
    var touche; // Touche sÃ©lectionnÃ©e par un clic de souris (1g1)
    var dessin; // Position dans le graphe d'Ã©tats modÃ¨lisant le dessin de la potence (1h1)
    var droitDeJouer; // BoolÃ©en : dÃ©sactive le clavier (sauf Rejouer) si le jeu est fini (1i1)
    var potence = { // Etats du graphe utilisÃ© pour dessiner la potence en fonction du
        base: 0, // nombre d'erreurs acceptÃ©es
        poteau: 1,
        brasPotence: 2,
        equerre: 3,
        corde: 4,
        tete: 5,
        corps: 6,
        brasD: 7,
        brasG: 8,
        jambeD: 9,
        jambeG: 10,
        deuxJambes: 11,
        deuxBras: 12,
        teteCorps: 13,
        brasEquerre: 14
    };
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    // --------------------------------------------------------
    // Fonctions
    var dessinerVisage = function (humeur, reduit) {
        context.strokeStyle = 'black';
        if (reduit) {
            context.clearRect(30, 70, 70, 70);
            context.lineWidth = 1;
            dessinerCercle(67, 52, 12, false)
            dessinerCercle(63, 48, 2, true);
            dessinerCercle(71, 48, 2, true);
            context.beginPath();
            context.arc(67, 64, 9, Math.PI / 180 * 310, Math.PI / 180 * 230, true);
            context.stroke();
        }
        else {
            context.lineWidth = 2;
            dessinerCercle(58, 105, 25, false)
            if (humeur === "joyeux") {
                dessinerCercle(68, 95, 5, true);
                dessinerCercle(48, 95, 5, true);
                context.beginPath();
                context.arc(58, 105, 18, Math.PI / 180 * 10, Math.PI / 180 * 170, false);
                context.stroke();
            } else {
                dessinerCercle(63, 95, 3, true);
                dessinerCercle(53, 95, 3, true);
                context.beginPath();
                context.arc(58, 130, 18, Math.PI / 180 * 310, Math.PI / 180 * 230, true);
                context.stroke();
            }
        }
    }
    var dessinerCercle = function (x, y, rayon, plein) {
        context.beginPath();
        context.arc(x, y, rayon, 0, 2 * Math.PI, false);
        if (plein)
            context.fill();
        else
            context.stroke();
    }
    var effacerCanevas = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    var resteEssais = function () {
        context.clearRect(0, 0, 115, 30);
        context.lineWidth = 1;
        context.font = "15px Arial";
        context.strokeText(nbErreursEnCours + " essais", 10, 20);
    }
    var dessinerPotence = function () {
        console.log("potence:" + dessin);
        switch (dessin) {
            case potence.base:
                effacerCanevas();
                dessinerVisage("triste");
                context.fillRect(5, 195, 105, 10);
                dessin = potence.poteau;
                break;
            case potence.poteau:
                context.fillRect(10, 30, 5, 165);
                if (nbErreursmax === 7) {
                    dessin = potence.brasEquerre;
                } else {
                    dessin = potence.brasPotence;
                }
                break;
            case potence.brasPotence:
                context.fillRect(10, 30, 60, 5);
                dessin = potence.equerre;
                break;
            case potence.equerre:
                context.lineWidth = 4;
                context.beginPath();
                context.moveTo(40, 32);
                context.lineTo(12, 70);
                context.stroke();
                dessin = potence.corde;
                break;
            case potence.corde:
                context.fillRect(65, 30, 5, 10);
                if ((nbErreursmax === 7) || (nbErreursmax === 8)) {
                    dessin = potence.teteCorps;
                } else {
                    dessin = potence.tete;
                }
                break;
            case potence.tete:
                dessinerVisage("triste", true);
                dessin++;
                break;
            case potence.corps:
                context.lineWidth = 2;
                context.beginPath();
                context.moveTo(67, 63);
                context.lineTo(67, 93);
                context.stroke();
                if (nbErreursmax === 9) {
                    dessin = potence.deuxBras;
                } else {
                    dessin = potence.brasD;
                }
                break;
            case potence.brasD:
                context.beginPath();
                context.moveTo(67, 78);
                context.lineTo(43, 64);
                context.stroke();
                dessin = potence.brasG;
                break;
            case potence.brasG:
                context.beginPath();
                context.moveTo(67, 78);
                context.lineTo(91, 64);
                context.stroke();
                if (nbErreursmax === 10) {
                    dessin = potence.deuxJambes;
                } else {
                    dessin = potence.jambeD;
                }
                break;
            case potence.jambeD:
                context.beginPath();
                context.moveTo(67, 93);
                context.lineTo(43, 107);
                context.stroke();
                dessin++;
                break;
            case potence.jambeG:
                context.beginPath();
                context.moveTo(67, 93);
                context.lineTo(91, 107);
                context.stroke();
                break;
            case potence.deuxJambes:
                context.beginPath();
                context.moveTo(67, 93);
                context.lineTo(43, 107);
                context.moveTo(67, 93);
                context.lineTo(91, 107);
                context.stroke();
                break;
            case potence.deuxBras:
                context.beginPath();
                context.moveTo(67, 78);
                context.lineTo(43, 64);
                context.moveTo(67, 78);
                context.lineTo(91, 64);
                context.stroke();
                dessin = potence.deuxJambes;
                break;
            case potence.teteCorps:
                dessinerVisage("triste", true);
                context.lineWidth = 2;
                context.beginPath();
                context.moveTo(67, 63);
                context.lineTo(67, 93);
                context.stroke();
                dessin = potence.deuxBras;
                break;
            case potence.brasEquerre:
                context.lineWidth = 4;
                context.beginPath();
                context.moveTo(40, 32);
                context.lineTo(12, 70);
                context.stroke();
                context.fillRect(10, 30, 60, 5);
                dessin = potence.corde;
                break;
        }
    }
    // Initialisation et Rejouer
    var initialisation = function () {
        $("#mot-cache").text("");
        $("#mot-cache").css("font-size", "50px");
        $(".touche").show(); // Affichage des touches du clavier (1j)
        // Choix alÃ©atoire d'un mot dans le tableau (1b2)
        motSecret = Tmots[Math.floor(Math.random() * Tmots.length)];
        // Initialisation du tableau pour la rÃ©ponse (1c2)
        TReponse.length = motSecret.length;
        for (var i = 0; i < motSecret.length; i++) {
            TReponse[i] = "-";
        }
        // Initialisations
        nbLettresManquantes = TReponse.length; // nombre de lettres Ã  chercher (1d2)
        nbErreursEnCours = nbLettresManquantes + 3; // nombre d'erreurs acceptÃ©es (1f2)
        nbErreursmax = nbErreursEnCours; // Sauvegarde du nombre d'erreurs max pour la construction du pendu
        touche = null; // touche sÃ©lectionnÃ©e par un clic de souris (1g2)
        dessin = 0; // position dans le graphe d'Ã©tats (1h2)
        droitDeJouer = true; // autorisation de jouer (1i2)

        // Instrumentation du code (A supprimer)
        console.log(motSecret, motSecret.length, TReponse.length, nbLettresManquantes, droitDeJouer, nbErreursEnCours);
        // Premier affichage de la progression  (1e)
        $("#mot-cache").html(TReponse.join(" "));
    }
    // --------------------------------------------------------
    // 2. Partie de code exÃ©cutÃ©e au chargement de la page
    initialisation(); // premier jeu et rejouer
    dessinerVisage("joyeux", false);
    resteEssais();     // Affichage du nombre d'essais

    // 3. Boucle de jeu exÃ©cutÃ©e sur un Ã©vÃ¨nement
    $(".touche").click(function () {
        if (droitDeJouer) {
            // DÃ©tection de la touche
            touche = $(this).text().toLocaleLowerCase(); // (2a)
            console.log(touche); // Instrumentation du code (A supprimer) 
            // si Touche Rejouer 
            if (touche === "rejouer") {
                initialisation();
                effacerCanevas(); dessinerVisage("joyeux", false);
                // Affichage du nombre d'essais
                resteEssais();
            }
            // sinon si toutes les lettres ne sont pas trouvÃ©es 
            else if (nbLettresManquantes > 0) { // Test de la rÃ©ponse (2b)
                $(this).hide();
                var lettreTrouvee = false;
                for (var j = 0; j < motSecret.length; j++) {
                    if ((motSecret[j] === touche) && (TReponse[j] === "-")) {
                        console.log(j); // Instrumentation du code (A supprimer)
                        TReponse[j] = touche; // Copier la lettre Ã  sa position dans le mot
                        nbLettresManquantes--;
                        console.log(touche, nbLettresManquantes); // Instrumentation du code (A supprimer)
                        // Affichage de la progression  (1e)
                        $("#mot-cache").html(TReponse.join(" "));
                        lettreTrouvee = true;
                    }
                }
                if (lettreTrouvee === false) {
                    dessinerPotence();
                    nbErreursEnCours--;
                    if (nbErreursEnCours === 0) {
                        resteEssais();
                        droitDeJouer = false; // DÃ©sactivation du clavier si le nombre de coups est atteint
                        // Message Vous avez perdu
                        $("#mot-cache").css("font-size", "18px");
                        $("#mot-cache").html("Vous avez <font color=\"red\">PERDU</font>, le mot Ã©tait " + motSecret.toLocaleUpperCase());
                    }
                    else {
                        resteEssais();
                    }
                }

                // Message de fÃ©licitation (2c)
                if (nbLettresManquantes === 0) {
                    droitDeJouer = false; // DÃ©sactivation du clavier si le nombre de coups est atteint
                    for (var k = 0; k < motSecret.length; k++) {
                        TReponse[k] = TReponse[k].toLocaleUpperCase();
                    }
                    $("#mot-cache").css("font-size", "20px");
                    $("#mot-cache").text("FÃ©licitation, le mot est bien " + TReponse.join(""));
                }
            }

            console.log(motSecret, motSecret.length, TReponse.length, nbLettresManquantes, droitDeJouer, nbErreursEnCours); // Tests A supprimer
        } // fin droitDeJouer
        else { // Clavier inactif sauf touche "Rejouer"
            // DÃ©tection de la touche
            touche = $(this).text().toLocaleLowerCase(); // (2a)
            console.log(touche); // Instrumentation du code (A supprimer) 
            // si Touche Rejouer 
            if (touche === "rejouer") {
                initialisation();
                effacerCanevas(); dessinerVisage("joyeux", false);
                resteEssais();
            }
        }
    });
});

