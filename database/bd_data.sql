CREATE DATABASE IF NOT EXISTS clothes_to_share CHARACTER SET = 'utf8mb4';

USE clothes_to_share;

/* BASES DE DONNEES */
CREATE TABLE IF NOT EXISTS site ( /* clothes_to_share */
	idSite INT(20) NOT NULL,
	nom VARCHAR(50) NOT NULL,
	adresse TEXT NOT NULL,
	code_postal INT(4) NOT NULL,
	localite VARCHAR(50) NOT NULL,
	photo TEXT NOT NULL,
	PRIMARY KEY(idSite)
) engine=innodb;

CREATE TABLE IF NOT EXISTS local ( /* salle 1 */
	idLocal INT(20) NOT NULL,
	nom VARCHAR(50) NOT NULL,
	infoLocal TEXT NOT NULL,
	idSite INT(20) NOT NULL,
	photo TEXT NOT NULL,
	PRIMARY KEY(idLocal),
	KEY(idSite)
) engine=innodb;

CREATE TABLE IF NOT EXISTS rangement ( /* armoire */
	idRangement INT(20) NOT NULL,
	nom VARCHAR(50) NOT NULL,
	infoRangement TEXT NOT NULL,
	idLocal INT(20) NOT NULL,
	photo TEXT NOT NULL,
	PRIMARY KEY(idRangement),
	KEY(idLocal)
) engine=innodb;

CREATE TABLE IF NOT EXISTS niveau ( /* etage */
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
	datefinreelle DATETIME NOT NULL,
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
		

/* DONNEES */
INSERT INTO site(idSite, nom, adresse, code_postal, localite, photo) VALUES
(1, 'Clothes to Share', "https://clothestoshare.ovh/", 7000, "Mons", '');

INSERT INTO local(idLocal, nom, infoLocal, idSite, photo) VALUES
(1, '', "", 1, "");

INSERT INTO rangement(idRangement, nom, infoRangement, idLocal, photo) VALUES
(1, '', "", 1, "");

INSERT INTO niveau(idNiveau, nom, infoNiveau, idRangement, photo) VALUES
(1, '', "", 1, "");

INSERT INTO categorie(idcategorie, nom, infoPlus) VALUES
(1, 'Sportwear', 'Used for sports activities'),
(2, 'Accessories', 'Accessories for daily use'),
(3, 'Nightwear', 'Clothing for sleeping');

INSERT INTO utilisateur(idutilisateur, email, nom, prenom, adresse, login, mdp, role) VALUES
(1, 'tarisah@example.com', 'Tarisa', "Hannah", "123 Main St", "hannahtaisa", "hannahtaisa", 'admin'),
(2, 'does@example.com', 'Doe', "Suria", "456 Oak Ave", "doesuria", "doesuria", 'admin'),
(3, 'griffithn@example.com', 'Griffith', "Nephtali", "789 Pine Rd", "griffithnephtali", "griffithnephtali", 'admin');

INSERT INTO vetement(idvetement, nom, taille, type, couleur, etat, genre, marque, photo, idcategorie, idniveau, idproprietaire, description) VALUES
(1, '', "2XL", "", "", ''),
(2, '', "L", "", "", ''),
(3, '', "XS", "", "", '');