CREATE DATABASE IF NOT EXISTS clothet53 CHARACTER SET = 'utf8mb4';

USE clothet53;

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
	role VARCHAR(10) DEFAULT 'pending', /* admin, user, owner, pending */
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
(1, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements basiques.', 1, ''),
(2, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires basiques.', 1, ''),
(3, 'Meuble à chaussures', 'Rangement pour les chaussures.', 1, ''),
-- Pour le local 2 (Chic)
(4, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements chics.', 2, ''),
(5, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires chics.', 2, ''),
(6, 'Meuble à chaussures', 'Rangement pour les chaussures.', 2, ''),
-- Pour le local 3 (Business)
(7, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements professionnels.', 3, ''),
(8, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires professionnels.', 3, ''),
(9, 'Meuble à chaussures', 'Rangement pour les chaussures.', 3, ''),
-- Pour le local 4 (Boho)
(10, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements bohèmes.', 4, ''),
(11, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires bohèmes.', 4, ''),
(12, 'Meuble à chaussures', 'Rangement pour les chaussures.', 4, ''),
-- Pour le local 5 (Street wear)
(13, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements street wear.', 5, ''),
(14, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires street wear.', 5, ''),
(15, 'Meuble à chaussures', 'Rangement pour les chaussures.', 5, ''),
-- Pour le local 6 (Emo)
(16, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements punk/emo.', 6, ''),
(17, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires punk/emo.', 6, ''),
(18, 'Meuble à chaussures', 'Rangement pour les chaussures.', 6, ''),
-- Pour le local 7 (Sorties)
(19, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements de sorties.', 7, ''),
(20, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires de sorties.', 7, ''),
(21, 'Meuble à chaussures', 'Rangement pour les chaussures.', 7, ''),
-- Pour le local 8 (Vintage)
(22, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements vintage.', 8, ''),
(23, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires vintage.', 8, ''),
(24, 'Meuble à chaussures', 'Rangement pour les chaussures.', 8, ''),
-- Pour le local 9 (2000s)
(25, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements du style des annèes 2000s.', 9, ''),
(26, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires des annèes 2000s.', 9, ''),
(27, 'Meuble à chaussures', 'Rangement pour les chaussures.', 9, ''),
-- Pour le local 10 (Autre)
(28, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements.', 10, ''),
(29, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires.', 10, ''),
(30, 'Meuble à chaussures', 'Rangement pour les chaussures.', 10, '');

/* NIVEAUX */
INSERT INTO niveau(idNiveau, nom, infoNiveau, idRangement, photo) VALUES
-- ===============================
-- LOCAL 1 : CASUAL (Rangements 1, 2, 3)
-- ===============================
(1, 'Penderie', 'Pour les vestes, chemises et manteaux basiques', 1, ''),
(2, 'Étagères', 'Pour les t-shirts et pulls', 1, ''),
(3, 'Tiroirs bas', 'Pour les pantalons, jeans et shorts', 1, ''),
(4, 'Tiroir du haut', 'Bijoux, montres et lunettes de soleil', 2, ''),
(5, 'Tiroir d''en bas', 'Sacs, ceintures et bonnets', 2, ''),
(6, 'Niveau Supérieur', 'Baskets et chaussures de tous les jours', 3, ''),
(7, 'Niveau Inférieur', 'Bottes et chaussures d''hiver', 3, ''),

-- ===============================
-- LOCAL 2 : CHIC (Rangements 4, 5, 6)
-- ===============================
(8, 'Penderie', 'Vestons, costumes et robes élégantes', 4, ''),
(9, 'Étagères', 'Hauts habillés et chemisiers', 4, ''),
(10, 'Tiroirs bas', 'Pantalons à pinces et jupes', 4, ''),
(11, 'Tiroir du haut', 'Bijoux fins et montres de luxe', 5, ''),
(12, 'Tiroir d''en bas', 'Sacs à main et pochettes de marque', 5, ''),
(13, 'Niveau Supérieur', 'Mocassins et derbies', 6, ''),
(14, 'Niveau Inférieur', 'Escarpins et chaussures habillées', 6, ''),

-- ===============================
-- LOCAL 3 : BUSINESS (Rangements 7, 8, 9)
-- ===============================
(15, 'Penderie', 'Costumes complets, blazers et tailleurs', 7, ''),
(16, 'Étagères', 'Chemises repassées', 7, ''),
(17, 'Tiroirs bas', 'Pantalons de costume', 7, ''),
(18, 'Tiroir du haut', 'Cravates, nœuds papillon et boutons de manchette', 8, ''),
(19, 'Tiroir d''en bas', 'Porte-documents et ceintures en cuir', 8, ''),
(20, 'Niveau Supérieur', 'Chaussures de ville (Oxford, Richelieu)', 9, ''),
(21, 'Niveau Inférieur', 'Chaussures de secours ou de confort', 9, ''),

-- ===============================
-- LOCAL 4 : BOHO (Rangements 10, 11, 12)
-- ===============================
(22, 'Penderie', 'Robes longues, gilets à franges, kimonos', 10, ''),
(23, 'Étagères', 'Hauts amples et tuniques', 10, ''),
(24, 'Tiroirs bas', 'Pantalons fluides et jupes longues', 10, ''),
(25, 'Tiroir du haut', 'Colliers longs, bracelets en perles et pierres', 11, ''),
(26, 'Tiroir d''en bas', 'Chapeaux, foulards et sacs en macramé', 11, ''),
(27, 'Niveau Supérieur', 'Sandales et espadrilles', 12, ''),
(28, 'Niveau Inférieur', 'Bottes en daim', 12, ''),

-- ===============================
-- LOCAL 5 : STREET WEAR (Rangements 13, 14, 15)
-- ===============================
(29, 'Penderie', 'Vestes oversize, doudounes et coupe-vents', 13, ''),
(30, 'Étagères', 'Sweats à capuche, t-shirts graphiques', 13, ''),
(31, 'Tiroirs bas', 'Pantalons, jeans, cargo, joggings', 13, ''),
(32, 'Tiroir du haut', 'Casquettes, bobs et lunettes de soleil', 14, ''),
(33, 'Tiroir d''en bas', 'Sacs banane, sacoches et sacs à dos', 14, ''),
(34, 'Niveau Supérieur', 'Sneakers de collection', 15, ''),
(35, 'Niveau Inférieur', 'Baskets de tous les jours', 15, ''),

-- ===============================
-- LOCAL 6 : EMO (Rangements 16, 17, 18)
-- ===============================
(36, 'Penderie', 'Vestes en cuir, manteaux sombres', 16, ''),
(37, 'Étagères', 'T-shirts de groupes, hauts résille', 16, ''),
(38, 'Tiroirs bas', 'Jeans skinny déchirés, pantalons à clous', 16, ''),
(39, 'Tiroir du haut', 'Bracelets à clous, chaînes, bagues', 17, ''),
(40, 'Tiroir d''en bas', 'Ceintures cloutées, mitaines', 17, ''),
(41, 'Niveau Supérieur', 'Bottes à plateformes et creepers', 18, ''),
(42, 'Niveau Inférieur', 'Converse et Vans usées', 18, ''),

-- ===============================
-- LOCAL 7 : SORTIES (Rangements 19, 20, 21)
-- ===============================
(43, 'Penderie', 'Robes de cocktail, vestes brillantes', 19, ''),
(44, 'Étagères', 'Hauts de soirée, tops à paillettes', 19, ''),
(45, 'Tiroirs bas', 'Pantalons en simili cuir, jupes courtes', 19, ''),
(46, 'Tiroir du haut', 'Parures complètes, boucles d''oreilles', 20, ''),
(47, 'Tiroir d''en bas', 'Petites pochettes de soirée', 20, ''),
(48, 'Niveau Supérieur', 'Talons hauts et stilettos', 21, ''),
(49, 'Niveau Inférieur', 'Chaussures de danse', 21, ''),

-- ===============================
-- LOCAL 8 : VINTAGE (Rangements 22, 23, 24)
-- ===============================
(50, 'Penderie', 'Manteaux rétro, vestes en velours côtelé', 22, ''),
(51, 'Étagères', 'Chemisiers anciens, tricots', 22, ''),
(52, 'Tiroirs bas', 'Pantalons patte d''éléphant', 22, ''),
(53, 'Tiroir du haut', 'Broches, montres à gousset, colliers de perles', 23, ''),
(54, 'Tiroir d''en bas', 'Sacs rétro en cuir, gants en dentelle', 23, ''),
(55, 'Niveau Supérieur', 'Chaussures à boucles', 24, ''),
(56, 'Niveau Inférieur', 'Bottes vintage', 24, ''),

-- ===============================
-- LOCAL 9 : 2000s (Rangements 25, 26, 27)
-- ===============================
(57, 'Penderie', 'Vestes en jean, survêtements en velours', 25, ''),
(58, 'Étagères', 'Crop tops, t-shirts à strass', 25, ''),
(59, 'Tiroirs bas', 'Jeans taille basse, mini-jupes plissées', 25, ''),
(60, 'Tiroir du haut', 'Chokers, pinces papillon, lunettes colorées', 26, ''),
(61, 'Tiroir d''en bas', 'Sacs baguette, ceintures chaînes', 26, ''),
(62, 'Niveau Supérieur', 'Sneakers chunky, Bottes Ugg', 27, ''),
(63, 'Niveau Inférieur', 'Chaussures compensées, talons', 27, ''),

-- ===============================
-- LOCAL 10 : AUTRE (Rangements 28, 29, 30)
-- ===============================
(64, 'Penderie', 'Vestes et manteaux divers', 28, ''),
(65, 'Étagères', 'Hauts et pulls divers', 28, ''),
(66, 'Tiroirs bas', 'Pantalons et shorts divers', 28, ''),
(67, 'Tiroir du haut', 'Bijoux en vrac', 29, ''),
(68, 'Tiroir d''en bas', 'Sacs et accessoires divers', 29, ''),
(69, 'Niveau Supérieur', 'Chaussures avec talons divers', 30, ''),
(70, 'Niveau Inférieur', 'Chaussures basses diverses', 30, '');

INSERT INTO categorie(idcategorie, nom, infoPlus) VALUES
(1, 'Hauts', 'T-shirts, chemises, pulls, tops, débardeurs...'),
(2, 'Bas', 'Jeans, pantalons, shorts, jupes...'),
(3, 'Robes & Combinaisons', 'Tenues une pièce pour tous les jours ou soirées.'),
(4, 'Manteaux & Vestes', 'Vêtements d''extérieur, blousons, trenchs, doudounes...'),
(5, 'Chaussures', 'Baskets, bottes, talons, sandales, mocassins...'),
(6, 'Accessoires', 'Sacs, ceintures, chapeaux, écharpes, gants...'),
(7, 'Bijoux', 'Colliers, bracelets, bagues, montres, boucles d''oreilles...'),
(8, 'Vêtements de sport', 'Tenues, brassières et accessoires pour l''activité physique.'),
(9, 'Vêtements de nuit', 'Pyjamas, nuisettes, peignoirs et vêtements d''intérieur.'),
(10, 'Sous-vêtements', 'Lingerie, chaussettes, collants.'),
(11, 'Autre','Autre categorie.');

INSERT INTO utilisateur(idutilisateur, email, nom, prenom, adresse, login, mdp, role) VALUES
(1, 'hannah34@exemple.com', 'Tarisa', "Hannah", "123 Main St", "titi67", "$2y$10$X1QugRmLPF/x.H7kroXyFeKqeYP7Z/KK487lUnSws/ayKTMs.Db1.", 'admin'),
(2, 'does@example.com', 'Doe', "Suria", "456 Oak Ave", "doesuria", "$2y$10$wwkkLT8/ludckNTZ74vLe.MVdKHOJzD699zmRCGuTBcmevhdyTj2C", 'admin'),
(3, 'griffithn@example.com', 'Griffith', "Nephtali", "789 Pine Rd", "griffithnephtali", "$2y$10$wSjGBh27Vav1qiuOWwvYpe0ecvZj.BFOp1vy5fT1GgCF/pdJ/JHre", 'admin'),
(4, 'feliciaKan@example.com', 'Kanud', "Felicia", "321 Super Rd", "fekan", "$2y$10$s3uvW27negmw1w/eHQ6HhO7JdX7yj3WB78Y/1TV8DJMvdOykRWD7i", 'user');

INSERT INTO vetement(idvetement, nom, taille, type, couleur, etat, genre, marque, photo, idcategorie, idniveau, idproprietaire, description) VALUES
(1, 'T-shirt Running Pro', 'M', 'Haut', 'Noir', 'Disponible', 'homme', 'Nike', 'assets/img/wardrobe/tshirt_nike.jpg', 1, 2, 1, 'T-shirt très respirant, idéal pour le jogging. Très bon état.'),
(2, 'Sacoche en cuir', 'TU', 'Sac', 'Marron', 'En prêt', 'mixte', 'Fossil', 'assets/img/wardrobe/sacoche_fossil.jpg', 6, 5, 2, 'Petite sacoche pratique pour tous les jours.'),
(3, 'Pyjama Ensemble', 'L', 'Ensemble', 'Noir', 'Au lavage', 'femme', 'Etam', 'assets/img/wardrobe/pyjama_etam.jpg', 9, 65, 3, 'Ensemble très chaud pour l''hiver.'),
(4, 'Bijoux vancleef', 'TU', 'Bracelet', 'Doré', 'Disponible', 'femme', 'VanCleef', 'assets/img/wardrobe/vancleef.jpg', 7, 11, 4, 'Bijoux Vancleef tendance.');