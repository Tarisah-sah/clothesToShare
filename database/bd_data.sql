CREATE DATABASE IF NOT EXISTS clothes_to_share CHARACTER SET = 'utf8mb4';

USE clothes_to_share;

/* BASES DE DONNEES */
CREATE TABLE IF NOT EXISTS site ( /* clothes_to_share */
	idSite INT(20) NOT NULL AUTO_INCREMENT,
	nom VARCHAR(50) NOT NULL,
	adresse TEXT NOT NULL,
	code_postal INT(4) NOT NULL,
	localite VARCHAR(50) NOT NULL,
	photo TEXT NOT NULL,
	PRIMARY KEY(idSite)
) engine=innodb;

CREATE TABLE IF NOT EXISTS local ( /* salle 1 */
	idLocal INT(20) NOT NULL AUTO_INCREMENT,
	nom VARCHAR(50) NOT NULL,
	infoLocal TEXT NOT NULL,
	idSite INT(20) NOT NULL,
	photo TEXT NOT NULL,
	PRIMARY KEY(idLocal),
	KEY(idSite)
) engine=innodb;

CREATE TABLE IF NOT EXISTS rangement ( /* armoire */
	idRangement INT(20) NOT NULL AUTO_INCREMENT,
	nom VARCHAR(50) NOT NULL,
	infoRangement TEXT NOT NULL,
	idLocal INT(20) NOT NULL,
	photo TEXT NOT NULL,
	PRIMARY KEY(idRangement),
	KEY(idLocal)
) engine=innodb;

CREATE TABLE IF NOT EXISTS niveau ( /* etage */
	idNiveau INT(20) NOT NULL AUTO_INCREMENT,
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
	idcategorie INT(20) NOT NULL AUTO_INCREMENT,
	nom VARCHAR(50) NOT NULL,
	infoPlus TEXT NOT NULL,
	PRIMARY KEY(idcategorie)
) engine=innodb;

CREATE TABLE IF NOT EXISTS vetement (
	idvetement INT(20) NOT NULL AUTO_INCREMENT,
	nom VARCHAR(50) NOT NULL,
	taille VARCHAR(3) NOT NULL,
	type VARCHAR(20) NOT NULL, 
	couleur VARCHAR(20) NOT NULL,
	etat VARCHAR(20) NOT NULL, /* statut: dispo */
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
	idutilisateur INT(20) NOT NULL AUTO_INCREMENT,
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
	idpret INT(20) NOT NULL AUTO_INCREMENT,
	idvetement INT(20) NOT NULL,
	idemprunteur INT(20) NOT NULL,
	datedebut DATETIME DEFAULT CURRENT_TIMESTAMP,
	datefinprevue DATETIME,
	datefinreelle DATETIME,
	commentaire TEXT,
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
		

/* DONNEES */
INSERT INTO site(idSite, nom, adresse, code_postal, localite, photo) VALUES
(1, 'CToS - Mons', "Chaussée de Binche 159", 7000, "Mons", 'assets/icons/ctos.png'),
(2, 'CToS - Charleroi', "Grand’Rue 1", 6000, "Charleroi", 'assets/icons/ctos.png'),
(3, 'CToS - La Louvière', "Rue Ferrer 159", 7100, "Haine-Saint-Paul", 'assets/icons/ctos.png'),
(4, 'CToS - Tournai', "Rue Frinoise 12", 7500, "Tournai", 'assets/icons/ctos.png');

INSERT INTO local(idLocal, nom, infoLocal, idSite, photo) VALUES
(1, 'Casual', "Vetements et accessoires classiques.", 1, 'assets/img/local/CASUAL.jpg'),
(2, 'Chic', "Vetements et accessoires chic.", 1, 'assets/img/local/chic.jpg'),
(3, 'Business', "Vetements et accessoires professionnels.", 1, 'assets/img/local/Business.jpg'),
(4, 'Boheme', "Vetements et accessoires boho.", 1, 'assets/img/local/boho.jpg'),
(5, 'Street wear', "Vetements et accessoires streetwear.", 1, 'assets/img/local/streetwear.jpg'),
(6, 'Emo', "Vetements et accessoires emo et punk.", 1, 'assets/img/local/emo.jpg'),
(7, 'Sorties', "Vetements et accessoires pour sortir le soir.", 1, 'assets/img/local/nisy.jpg'),
(8, 'Vintage', "Vetements et accessoires vintage.", 1, 'assets/img/local/VINTAGE.jpg'),
(9, 'Y2k', "Vetements et accessoires des années 2000.", 1, 'assets/img/local/y2k.jpg'),
(10, 'Autre', "Vetements et accessoires sans catégorie.", 1, 'assets/img/local/AUTRE.jpg');

/* RANGEMENTS */
INSERT INTO rangement(idRangement, nom, infoRangement, idLocal, photo) VALUES
-- Pour le local 1 (Casual)
(1, 'Armoire Principale', 'Grande armoire 3 portes', 1, ''),
(2, 'Commode en bois', 'Commode à tiroirs pour les basiques', 1, ''),
-- Pour le local 3 (Business)
(3, 'Dressing Ouvert', 'Penderie pour costumes et chemises', 3, ''),
(4, 'Meuble à chaussures', 'Meuble d''entrée', 3, ''),
-- Pour le local 5 (Street wear)
(5, 'Portant métallique', 'Portant robuste pour vestes et sweats', 5, ''),
(6, 'Mur de Sneakers', 'Étagères transparentes pour chaussures', 5, ''),
-- Pour le local 8 (Vintage)
(7, 'Malle de voyage', 'Ancienne malle en cuir', 8, ''),
(8, 'Armoire parisienne', 'Armoire chinée en brocante', 8, '');

/* NIVEAUX */
INSERT INTO niveau(idNiveau, nom, infoNiveau, idRangement, photo) VALUES
-- Dans l'Armoire Principale Casual (idRangement = 1)
(1, 'Étagère du haut', 'Pour les pulls et sweats', 1, ''),
(2, 'Penderie', 'Pour les vestes, manteaux et chemises', 1, ''),
(3, 'Étagère du bas', 'Pour les pantalons et jeans', 1, ''),

-- Dans la Commode en bois Casual (idRangement = 2)
(4, 'Tiroir 1 (Haut)', 'Sous-vêtements et chaussettes', 2, ''),
(5, 'Tiroir 2', 'T-shirts manches courtes', 2, ''),
(6, 'Tiroir 3', 'T-shirts manches longues', 2, ''),

-- Dans le Dressing Ouvert Business (idRangement = 3)
(7, 'Penderie Costumes', 'Cintres pour ensembles et vestons', 3, ''),
(8, 'Penderie Chemises', 'Espace repassé', 3, ''),
(9, 'Tiroir Accessoires', 'Cravates, ceintures, montres', 3, ''),

-- Dans le Meuble à chaussures Business (idRangement = 4)
(10, 'Niveau Supérieur', 'Chaussures de ville', 4, ''),
(11, 'Niveau Inférieur', 'Chaussures détendues', 4, ''),

-- Dans le Portant métallique Street wear (idRangement = 5)
(12, 'Barre principale', 'Vestes oversize', 5, ''),

-- Dans la Malle Vintage (idRangement = 7)
(13, 'Fond de malle', 'Gros sacs et accessoires d''hiver', 7, ''),
(14, 'Compartiment supérieur', 'Foulards, chapeaux et bijoux', 7, '');

INSERT INTO categorie(idcategorie, nom, infoPlus) VALUES
(1, 'Sportwear', 'Used for sports activities'),
(2, 'Accessories', 'Accessories for daily use'),
(3, 'Nightwear', 'Clothing for sleeping');

INSERT INTO utilisateur(idutilisateur, email, nom, prenom, adresse, login, mdp, role) VALUES
(1, 'tarisah@example.com', 'Tarisa', "Hannah", "123 Main St", "hannahtaisa", "hannahtaisa", 'admin'),
(2, 'does@example.com', 'Doe', "Suria", "456 Oak Ave", "doesuria", "doesuria", 'admin'),
(3, 'griffithn@example.com', 'Griffith', "Nephtali", "789 Pine Rd", "griffithnephtali", "griffithnephtali", 'admin'),
(4, 'feliciaKan@example.com', 'Kanud', "Felicia", "321 Super Rd", "fekan", "fekan", 'user');

INSERT INTO vetement(idvetement, nom, taille, type, couleur, etat, genre, marque, photo, idcategorie, idniveau, idproprietaire, description) VALUES
(1, 'T-shirt Running Pro', 'M', 'Haut', 'Rose', 'Disponible', 'homme', 'Nike', 'assets/img/wardrobe/tshirt_nike.jpg', 1, 1, 1, 'T-shirt très respirant, idéal pour le jogging. Très bon état.'),
(2, 'Sacoche en cuir', 'TU', 'Sac', 'Marron', 'En prêt', 'mixte', 'Fossil', 'assets/img/wardrobe/sacoche_fossil.jpg', 2, 1, 2, 'Petite sacoche pratique pour tous les jours. Prêtée à Hannah jusqu''à la fin du mois.'),
(3, 'Pyjama Pilou', 'L', 'Ensemble', 'Bleu', 'Au lavage', 'femme', 'Etam', 'assets/img/wardrobe/pyjama_etam.jpg', 3, 1, 3, 'Ensemble très chaud pour l''hiver.'),
(4, 'Bijoux vancleef', 'TU', 'Bracelet', 'Doré', 'Disponible', 'femme', 'Etam', 'assets/img/wardrobe/vancleef.jpg', 2, 1, 3, 'Bijoux Vancleef tendance.');