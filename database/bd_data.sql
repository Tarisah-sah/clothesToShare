CREATE DATABASE IF NOT EXISTS clothes_to_share CHARACTER SET = 'utf8mb4';

USE clothes_to_share;

CREATE TABLE IF NOT EXISTS site ( 
    idSite INT(20) NOT NULL,
    nom VARCHAR(50) NOT NULL,
    adresse TEXT NOT NULL,
    code_postal INT(4) NOT NULL,
    localite VARCHAR(50) NOT NULL,
    photo TEXT NOT NULL,
    PRIMARY KEY(idSite)
) engine=innodb;

CREATE TABLE IF NOT EXISTS local ( 
    idLocal INT(20) NOT NULL,
    nom VARCHAR(50) NOT NULL,
    infoLocal TEXT NOT NULL,
    idSite INT(20) NOT NULL,
    photo TEXT NOT NULL,
    PRIMARY KEY(idLocal),
    KEY(idSite)
) engine=innodb;

CREATE TABLE IF NOT EXISTS rangement ( 
    idRangement INT(20) NOT NULL,
    nom VARCHAR(50) NOT NULL,
    infoRangement TEXT NOT NULL,
    idLocal INT(20) NOT NULL,
    photo TEXT NOT NULL,
    PRIMARY KEY(idRangement),
    KEY(idLocal)
) engine=innodb;

CREATE TABLE IF NOT EXISTS niveau ( 
    idNiveau INT(20) NOT NULL,
    nom VARCHAR(50) NOT NULL,
    infoNiveau TEXT NOT NULL,
    idRangement INT(20) NOT NULL,
    photo TEXT NOT NULL,
    PRIMARY KEY(idNiveau),
    KEY(idRangement)
) engine=innodb;

ALTER TABLE local
    ADD CONSTRAINT fklocalsite
        FOREIGN KEY(idSite) REFERENCES site(idSite);
ALTER TABLE rangement
    ADD CONSTRAINT fkrangementlocal
        FOREIGN KEY(idLocal) REFERENCES local(idLocal);
ALTER TABLE niveau
    ADD CONSTRAINT fkniveaurangement
        FOREIGN KEY(idRangement) REFERENCES rangement(idRangement);


CREATE TABLE IF NOT EXISTS categorie (
    idcategorie INT(20) NOT NULL,
    nom VARCHAR(50) NOT NULL,
    infoPlus TEXT NOT NULL,
    PRIMARY KEY(idcategorie)
) engine=innodb;

CREATE TABLE IF NOT EXISTS vetement (
    idvetement INT(20) NOT NULL,
    nom VARCHAR(50) NOT NULL,
    taille VARCHAR(3) NOT NULL,
    type VARCHAR(20) NOT NULL, 
    couleur VARCHAR(20) NOT NULL,
    etat VARCHAR(20) NOT NULL, /* statut */
    genre VARCHAR(10) DEFAULT "mixte",
    marque VARCHAR(20) NOT NULL,
    photo VARCHAR(200) NOT NULL,
    idcategorie INT(20) NOT NULL,
    idniveau INT(20) NOT NULL,
    idproprietaire INT(20) NOT NULL,
    description TEXT NOT NULL, /* infoPlus */
    PRIMARY KEY(idvetement),
    KEY(idcategorie, idniveau, idproprietaire)
) engine=innodb;


CREATE TABLE IF NOT EXISTS utilisateur (
    idutilisateur INT(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    adresse TEXT NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    mdp TEXT NOT NULL,
    role VARCHAR(10) DEFAULT 'pending', /* admin, user, pending */
    PRIMARY KEY(idutilisateur)
) engine=innodb;

CREATE TABLE IF NOT EXISTS pret (
    idpret INT(20) NOT NULL,
    idvetement INT(20) NOT NULL,
    idemprunteur INT(20) NOT NULL,
    datedebut DATETIME NOT NULL,
    datefinprevue DATETIME NOT NULL,
    datefinreelle DATETIME NULL,
    commentaire TEXT NOT NULL,
    statutpret VARCHAR(200) NOT NULL,
    PRIMARY KEY(idpret),
    KEY(idvetement, idemprunteur)
) engine=innodb;

ALTER TABLE vetement
    ADD CONSTRAINT fkvetementcategorie
        FOREIGN KEY(idcategorie) REFERENCES categorie(idcategorie);
ALTER TABLE vetement
    ADD CONSTRAINT fkvetementniveau
        FOREIGN KEY(idniveau) REFERENCES niveau(idNiveau);
ALTER TABLE vetement
    ADD CONSTRAINT fkvetementproprietaire
        FOREIGN KEY(idproprietaire) REFERENCES utilisateur(idutilisateur);
ALTER TABLE pret
    ADD CONSTRAINT fkpretvetement
        FOREIGN KEY(idvetement) REFERENCES vetement(idvetement);
ALTER TABLE pret
    ADD CONSTRAINT fkpretemprenteur
        FOREIGN KEY(idemprunteur) REFERENCES utilisateur(idutilisateur);
        

/* ===================================================================== */
/* DONNEES CORRIGÉES - L'ARCHITECTURE PHYSIQUE ET LOGIQUE EST RESPECTÉE  */
/* ===================================================================== */

-- 1. SITES (Inchangés)
INSERT INTO site(idSite, nom, adresse, code_postal, localite, photo) VALUES
(1, 'CToS - Mons', "Chaussée de Binche 159", 7000, "Mons", 'assets/icons/ctos.png'),
(2, 'CToS - Charleroi', "Grand’Rue 1", 6000, "Charleroi", 'assets/icons/ctos.png'),
(3, 'CToS - La Louvière', "Rue Ferrer 159", 7100, "Haine-Saint-Paul", 'assets/icons/ctos.png');

-- 2. LOCAUX (Des vraies pièces dans tes sites)
INSERT INTO local(idLocal, nom, infoLocal, idSite, photo) VALUES
(1, 'Vestiaire Principal', "Grande salle pour les vêtements du quotidien", 1, ''),
(2, 'Réserve', "Stockage des vêtements hors saison", 2, ''),
(3, 'Local de Stockage', "Petite pièce de rangement", 3, '');

-- 3. RANGEMENTS (Les meubles dans tes pièces)
INSERT INTO rangement(idRangement, nom, infoRangement, idLocal, photo) VALUES
(1, 'Grande Armoire Principale', "Armoire en bois à double porte", 1, ""),
(2, 'Grande Armoire Réserve', "Armoire en bois à double porte", 2, ""),
(3, 'Grande Armoire Stockage', "Armoire en bois à double porte", 3, ""),
(4, 'Penderie Principale', "Tringles ouvertes", 1, ""),
(5, 'Penderie Réserve', "Tringles ouvertes", 2, ""),
(6, 'Penderie Stockage', "Tringles ouvertes", 3, ""),
(7, 'Commode Principale', "Commode à tiroirs", 1, ""),
(8, 'Commode Réserve', "Commode à tiroirs", 2, ""),
(9, 'Commode Stockage', "Commode à tiroirs", 3, "");

-- 4. NIVEAUX (L'emplacement exact dans le meuble)
INSERT INTO niveau(idNiveau, nom, infoNiveau, idRangement, photo) VALUES
-- Pour Rangement 1 : Grande Armoire Principale
(1, 'Étagère du haut', 'Pour les hauts pliés (t-shirts, pulls)', 1, ''),
(2, 'Étagère centrale', 'Pour les pantalons et jeans', 1, ''),
(3, 'Étagère du bas', 'Pour les vêtements de sport', 1, ''),
(4, 'Tiroir intérieur', 'Sous-vêtements et chaussettes', 1, ''),

-- Pour Rangement 2 : Grande Armoire Réserve
(5, 'Étagère du haut', 'Vêtements d\'hiver volumineux', 2, ''),
(6, 'Étagère centrale', 'Vêtements d\'été hors saison', 2, ''),
(7, 'Étagère du bas', 'Tenues de ski et montagne', 2, ''),
(8, 'Tiroir intérieur', 'Accessoires hors saison (gants, bonnets)', 2, ''),

-- Pour Rangement 3 : Grande Armoire Stockage
(9, 'Étagère du haut', 'Boîtes de rangement', 3, ''),
(10, 'Étagère centrale', 'Vêtements de rechange', 3, ''),
(11, 'Étagère du bas', 'Chaussures de rechange en boîte', 3, ''),

-- Pour Rangement 4 : Penderie Principale
(12, 'Tringle principale', 'Manteaux et vestes du quotidien', 4, ''),
(13, 'Tringle secondaire', 'Chemises, blouses et robes', 4, ''),
(14, 'Grille du bas', 'Chaussures du quotidien', 4, ''),
(15, 'Tablette supérieure', 'Chapeaux et casquettes', 4, ''),

-- Pour Rangement 5 : Penderie Réserve
(16, 'Tringle principale', 'Gros manteaux d\'hiver', 5, ''),
(17, 'Tringle secondaire', 'Combinaisons et salopettes', 5, ''),
(18, 'Grille du bas', 'Bottes et chaussures d\'hiver', 5, ''),

-- Pour Rangement 6 : Penderie Stockage
(19, 'Tringle gauche', 'Costumes et tenues de soirée', 6, ''),
(20, 'Tringle droite', 'Vêtements de travail ou spécifiques', 6, ''),
(21, 'Grille du bas', 'Chaussures de sécurité ou spécifiques', 6, ''),

-- Pour Rangement 7 : Commode Principale
(22, 'Tiroir du haut', 'Bijoux, montres et lunettes', 7, ''),
(23, 'Tiroir du milieu', 'Petits tops et débardeurs', 7, ''),
(24, 'Tiroir du bas', 'Shorts et petites jupes', 7, ''),

-- Pour Rangement 8 : Commode Réserve
(25, 'Tiroir du haut', 'Écharpes et foulards', 8, ''),
(26, 'Tiroir du milieu', 'Maillots de bain et affaires de plage', 8, ''),
(27, 'Tiroir du bas', 'Serviettes de plage', 8, ''),

-- Pour Rangement 9 : Commode Stockage
(28, 'Tiroir du haut', 'Petits accessoires divers', 9, ''),
(29, 'Tiroir du milieu', 'Sacs en tissu et tote bags', 9, ''),
(30, 'Tiroir du bas', 'Ceintures et bretelles', 9, '');

-- 5. CATÉGORIES (Le style / Le thème du vêtement)
INSERT INTO categorie(idcategorie, nom, infoPlus) VALUES
(1, 'Casual', 'Vêtements et accessoires classiques.'),
(2, 'Chic', 'Vêtements et accessoires chic.'),
(3, 'Business', 'Vêtements et accessoires professionnels.'),
(4, 'Boheme', 'Vêtements et accessoires boho.'),
(5, 'Street wear', 'Vêtements et accessoires streetwear.'),
(6, 'Emo', 'Vêtements et accessoires emo et punk.'),
(7, 'Sorties', 'Vêtements et accessoires pour sortir le soir.'),
(8, 'Vintage', 'Vêtements et accessoires vintage.'),
(9, 'Y2k', 'Vêtements et accessoires des années 2000.'),
(10, 'Autre', 'Vêtements et accessoires sans catégorie.'),
(11, 'Sportwear', 'Vêtements de sport.'),
(12, 'Nightwear', 'Vêtements de nuit.');

-- 6. UTILISATEURS (Inchangés)
INSERT INTO utilisateur(idutilisateur, email, nom, prenom, adresse, login, mdp, role) VALUES
(1, 'tarisah@example.com', 'Tarisa', "Hannah", "123 Main St", "hannahtaisa", "hannahtaisa", 'admin'),
(2, 'does@example.com', 'Doe', "Suria", "456 Oak Ave", "doesuria", "doesuria", 'admin'),
(3, 'griffithn@example.com', 'Griffith', "Nephtali", "789 Pine Rd", "griffithnephtali", "griffithnephtali", 'admin'),
(4, 'feliciaKan@example.com', 'Kanud', "Felicia", "321 Super Rd", "fekan", "fekan", 'user');

-- 7. VÊTEMENTS (Avec les bons types, bonnes catégories, et assignés aux bons niveaux physiques)
INSERT INTO vetement(idvetement, nom, taille, type, couleur, etat, genre, marque, photo, idcategorie, idniveau, idproprietaire, description) VALUES
(1, 'T-shirt Running Pro', 'M', 'T-shirt', 'Rose', 'Disponible', 'homme', 'Nike', 'assets/img/wardrobe/tshirt_nike.jpg', 11, 1, 1, 'T-shirt très respirant, idéal pour le jogging. Très bon état.'),
(2, 'Sacoche en cuir', 'TU', 'Sac', 'Marron', 'En prêt', 'mixte', 'Fossil', 'assets/img/wardrobe/sacoche_fossil.jpg', 1, 2, 2, 'Petite sacoche pratique pour tous les jours. Prêtée à Hannah.'),
(3, 'Pyjama Pilou', 'L', 'Ensemble', 'Bleu', 'Au lavage', 'femme', 'Etam', 'assets/img/wardrobe/pyjama_etam.jpg', 12, 4, 3, 'Ensemble très chaud pour l''hiver.'),
(4, 'Bijoux vancleef', 'TU', 'Bracelet', 'Doré', 'Disponible', 'femme', 'Etam', 'assets/img/wardrobe/vancleef.jpg', 2, 2, 3, 'Bijoux Vancleef tendance.');