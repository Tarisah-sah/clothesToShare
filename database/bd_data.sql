CREATE Database if not EXISTS clothet53;
USE clothet53;

CREATE TABLE IF NOT EXISTS site (
	idSite INT(20) NOT NULL AUTO_INCREMENT,
	nom VARCHAR(50) NOT NULL,
	adresse TEXT NOT NULL,
	code_postal INT(4) NOT NULL,
	localite VARCHAR(50) NOT NULL,
	photo TEXT NOT NULL,
	PRIMARY KEY(idSite)
) engine=innodb;

CREATE TABLE IF NOT EXISTS local (
	idLocal INT(20) NOT NULL AUTO_INCREMENT,
	nom VARCHAR(50) NOT NULL,
	infoLocal TEXT NOT NULL,
	idSite INT(20) NOT NULL,
	photo TEXT NOT NULL,
	PRIMARY KEY(idLocal),
	KEY(idSite)
) engine=innodb;

CREATE TABLE IF NOT EXISTS rangement (
	idRangement INT(20) NOT NULL AUTO_INCREMENT,
	nom VARCHAR(50) NOT NULL,
	infoRangement TEXT NOT NULL,
	idLocal INT(20) NOT NULL,
	photo TEXT NOT NULL,
	PRIMARY KEY(idRangement),
	KEY(idLocal)
) engine=innodb;

CREATE TABLE IF NOT EXISTS niveau (
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
	etat VARCHAR(20) NOT NULL,
	genre VARCHAR(10) DEFAULT "mixte",
	marque VARCHAR(20) NOT NULL,
	photo VARCHAR(200) NOT NULL,
	idcategorie INT(20) NOT NULL,
	idniveau INT(20) NOT NULL,
	idproprietaire INT(20) NOT NULL,
	description TEXT NOT NULL,
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
	role VARCHAR(10) DEFAULT 'pending',
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
(1, 'CToS - Durbuy', "Chaussée de la Princesse 67", 6940, "Durbuy", ' assets/img/site/site_69fccf164bce5.png'),
(2, 'CToS - Charleroi', "Grand Rue 1", 6000, "Charleroi", 'assets/img/site/site_69fccf631ee50.png'),
(3, 'CToS - La Louvière', "Rue Ferrer 193", 7100, "Haine-Saint-Paul", 'assets/img/site/site_69fcce2fea8fc.png'),
(4, 'CToS - Tournai', "Rue Frinoise 12", 7500, "Tournai", 'assets/img/site/site_69fcce9268edf.png'),
(5, 'CToS - Mons', "Chaussée de Binche 159", 7000, "Mons", 'assets/img/site/site_69fcceeb05c24.png');

INSERT INTO local(idLocal, nom, infoLocal, idSite, photo) VALUES
(1, 'Reserve CToS', "Vetements et accessoires en attente de catégorisation.", 1, 'assets/img/local/local_69fccfa094172.png'),
(2, 'Chic', "Vetements et accessoires chic.", 2, 'assets/img/local/chic.jpg'),
(3, 'Business', "Vetements et accessoires professionnels.", 3, 'assets/img/local/Business.jpg'),
(4, 'Boheme', "Vetements et accessoires boho.", 4, 'assets/img/local/boho.jpg'),
(5, 'Street wear', "Vetements et accessoires streetwear.", 5, 'assets/img/local/streetwear.jpg'),
(6, 'Emo', "Vetements et accessoires emo et punk.", 2, 'assets/img/local/emo.jpg'),
(7, 'Sorties', "Vetements et accessoires pour sortir le soir.", 3, 'assets/img/local/nisy.jpg'),
(8, 'Vintage', "Vetements et accessoires vintage.", 4, 'assets/img/local/VINTAGE.jpg'),
(9, 'Y2k', "Vetements et accessoires des années 2000.", 5, 'assets/img/local/y2k.jpg'),
(10, 'Autre', "Vetements et accessoires sans catégorie.", 2, 'assets/img/local/AUTRE.jpg'),
(11, 'Casual', "Vetements et accessoires classiques.", 3, 'assets/img/local/CASUAL.jpg');

/* RANGEMENTS */
INSERT INTO `rangement` (`idRangement`, `nom`, `infoRangement`, `idLocal`, `photo`) VALUES
(1, 'Armoire réserve', 'Grande armoire pour toutes sortes de vetements et accessoires.', 1, 'assets/img/rangement/rangement_69fc90e1abe35.png'),
(2, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements basiques.', 10, 'assets/img/rangement/rangement_69efcf479356c.jpg'),
(3, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires basiques.', 10, 'assets/img/rangement/rangement_69efcf829fdc8.jpg'),
(4, 'Meuble à chaussures', 'Rangement pour les chaussures.', 10, 'assets/img/rangement/rangement_69efcfa99dfe4.jpg'),
(5, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements chics.', 2, 'assets/img/rangement/rangement_69efc6884d42d.jpg'),
(6, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires chics.', 2, 'assets/img/rangement/rangement_69efc6dc001f2.jpg'),
(7, 'Meuble à chaussures', 'Rangement pour les chaussures.', 2, 'assets/img/rangement/rangement_69efc7d1c5674.jpg'),
(8, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements professionnels.', 3, 'assets/img/rangement/rangement_69efc8d0aa4ba.jpg'),
(9, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires professionnels.', 3, 'assets/img/rangement/rangement_69efc90201930.jpg'),
(10, 'Meuble à chaussures', 'Rangement pour les chaussures.', 3, 'assets/img/rangement/rangement_69efc94414543.jpg'),
(11, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements bohèmes.', 4, 'assets/img/rangement/rangement_69efc9ada7307.jpg'),
(12, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires bohèmes.', 4, 'assets/img/rangement/rangement_69efca540828a.jpg'),
(13, 'Meuble à chaussures', 'Rangement pour les chaussures.', 4, 'assets/img/rangement/rangement_69efca9918629.jpg'),
(14, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements street wear.', 5, 'assets/img/rangement/rangement_69efcb0f1f35b.jpg'),
(15, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires street wear.', 5, 'assets/img/rangement/rangement_69efcb271f623.jpg'),
(16, 'Meuble à chaussures', 'Rangement pour les chaussures.', 5, 'assets/img/rangement/rangement_69efcb432fba8.jpg'),
(17, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements punk/emo.', 6, 'assets/img/rangement/rangement_69efcb93752b1.jpg'),
(18, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires punk/emo.', 6, 'assets/img/rangement/rangement_69efcbbac2eba.jpg'),
(19, 'Meuble à chaussures', 'Rangement pour les chaussures.', 6, 'assets/img/rangement/rangement_69efcbe3c0cac.jpg'),
(20, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements de sorties.', 7, 'assets/img/rangement/rangement_69efcc5cde6a8.jpg'),
(21, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires de sorties.', 7, 'assets/img/rangement/rangement_69efccdf7d276.jpg'),
(22, 'Meuble à chaussures', 'Rangement pour les chaussures.', 7, 'assets/img/rangement/rangement_69efcc101269f.jpg'),
(23, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements vintage.', 8, 'assets/img/rangement/rangement_69efcd171486a.jpg'),
(24, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires vintage.', 8, 'assets/img/rangement/rangement_69efccfbb68ac.jpg'),
(25, 'Meuble à chaussures', 'Rangement pour les chaussures.', 8, 'assets/img/rangement/rangement_69efcd39e9b22.jpg'),
(26, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements du style des annèes 2000s.', 9, 'assets/img/rangement/rangement_69efcdd6db382.jpg'),
(27, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires des annèes 2000s.', 9, 'assets/img/rangement/rangement_69efce22996a6.jpg'),
(28, 'Meuble à chaussures', 'Rangement pour les chaussures.', 9, 'assets/img/rangement/rangement_69efcd6a84734.jpg'),
(29, 'Armoire pour vetements', 'Grande armoire avec portes coulissantes contenant toutes sortes de vetements.', 11, 'assets/img/rangement/rangement_69efcfdddf6cf.jpg'),
(30, 'Commode pour accessoires', 'Commode à tiroirs pour les accessoires.', 11, 'assets/img/rangement/rangement_69efcfcb3ee32.jpg'),
(31, 'Meuble à chaussures', 'Rangement pour les chaussures.', 11, 'assets/img/rangement/rangement_69efcf1051d90.jpg');

/* NIVEAUX */
INSERT INTO `niveau` (`idNiveau`, `nom`, `infoNiveau`, `idRangement`, `photo`) VALUES
(1, 'Penderie reserve', 'Pour tout type des vetements et accessoires.', 1, 'assets/img/niveau/niveau_69fcc761edb4e.png'),
(2, 'Penderie', 'Pour les vestes, chemises et manteaux basiques', 2, 'assets/img/niveau/niveau_69efd382daa48.jpg'),
(3, 'Étagères', 'Pour les t-shirts et pulls', 2, 'assets/img/niveau/niveau_69efd2c68c4a1.jpg'),
(4, 'Tiroirs bas', 'Pour les pantalons, jeans et shorts', 2, 'assets/img/niveau/niveau_69efd3e751333.jpg'),
(5, 'Tiroir du haut', 'Bijoux, montres et lunettes de soleil', 3, 'assets/img/niveau/niveau_69efd488478a0.jpg'),
(6, 'Tiroir d''en bas', 'Sacs, ceintures et bonnets', 3, 'assets/img/niveau/niveau_69efd44b07fa7.jpg'),
(7, 'Niveau Supérieur', 'Baskets et chaussures de tous les jours', 4, 'assets/img/niveau/niveau_69efd4ffb00a8.jpg'),
(8, 'Niveau Inférieur', 'Bottes et chaussures d''hiver', 4, 'assets/img/niveau/niveau_69efd4e21f7bf.jpg'),
(9, 'Penderie', 'Vestons, costumes et robes élégantes', 5, 'assets/img/niveau/niveau_69efd5ac0e7f2.jpg'),
(10, 'Étagères', 'Hauts habillés et chemisiers', 5, 'assets/img/niveau/niveau_69efd547f365e.jpg'),
(11, 'Tiroirs bas', 'Pantalons à pinces et jupes', 5, 'assets/img/niveau/niveau_69efd6e4cb5dd.jpg'),
(12, 'Tiroir du haut', 'Bijoux fins et montres de luxe', 6, 'assets/img/niveau/niveau_69efd74b2f3f2.jpg'),
(13, 'Tiroir d''en bas', 'Sacs à main et pochettes de marque', 6, 'assets/img/niveau/niveau_69efd71671f67.jpg'),
(14, 'Niveau Supérieur', 'Mocassins et derbies', 7, 'assets/img/niveau/niveau_69efd7a5d871c.jpg'),
(15, 'Niveau Inférieur', 'Escarpins et chaussures habillées', 7, 'assets/img/niveau/niveau_69efd778b3b91.jpg'),
(16, 'Penderie', 'Costumes complets, blazers et tailleurs', 8, 'assets/img/niveau/niveau_69efd8bba95b9.jpg'),
(17, 'Étagères', 'Chemises repassées', 8, 'assets/img/niveau/niveau_69efd7cc6aeb7.jpg'),
(18, 'Tiroirs bas', 'Pantalons de costume', 8, 'assets/img/niveau/niveau_69efd925d72e9.jpg'),
(19, 'Tiroir du haut', 'Cravates, n?uds papillon et boutons de manchette', 9, 'assets/img/niveau/niveau_69efd9cb0025c.jpg'),
(20, 'Tiroir d''en bas', 'Porte-documents et ceintures en cuir', 9, 'assets/img/niveau/niveau_69efd984ae9de.jpg'),
(21, 'Niveau Supérieur', 'Chaussures de ville (Oxford, Richelieu)', 10, 'assets/img/niveau/niveau_69efdb1843235.jpg'),
(22, 'Niveau Inférieur', 'Chaussures de secours ou de confort', 10, 'assets/img/niveau/niveau_69efda3000b2f.jpg'),
(23, 'Penderie', 'Robes longues, gilets à franges, kimonos', 11, 'assets/img/niveau/niveau_69efdcaf35292.jpg'),
(24, 'Étagères', 'Hauts amples et tuniques', 11, 'assets/img/niveau/niveau_69efdc0bdd1ab.jpg'),
(25, 'Tiroirs bas', 'Pantalons fluides et jupes longues', 11, 'assets/img/niveau/niveau_69efdddc333bb.jpg'),
(26, 'Tiroir du haut', 'Colliers longs, bracelets en perles et pierres', 12, 'assets/img/niveau/niveau_69efdec858e03.jpg'),
(27, 'Tiroir d''en bas', 'Chapeaux, foulards et sacs en macramé', 12, 'assets/img/niveau/niveau_69efde9c011ad.jpg'),
(28, 'Niveau Supérieur', 'Sandales et espadrilles', 13, 'assets/img/niveau/niveau_69efdfce7cd93.jpg'),
(29, 'Niveau Inférieur', 'Bottes en daim', 13, 'assets/img/niveau/niveau_69efdf4999bc4.jpg'),
(30, 'Penderie', 'Vestes oversize, doudounes et coupe-vents', 14, 'assets/img/niveau/niveau_69efe030d9330.jpg'),
(31, 'Étagères', 'Sweats à capuche, t-shirts graphiques', 14, 'assets/img/niveau/niveau_69efe00a95df5.jpg'),
(32, 'Tiroirs bas', 'Pantalons, jeans, cargo, joggings', 14, 'assets/img/niveau/niveau_69efe084b2eb5.jpg'),
(33, 'Tiroir du haut', 'Casquettes, bobs et lunettes de soleil', 15, 'assets/img/niveau/niveau_69efe108a1aba.jpg'),
(34, 'Tiroir d''en bas', 'Sacs banane, sacoches et sacs à dos', 15, 'assets/img/niveau/niveau_69efe0dd4fbfb.jpg'),
(35, 'Niveau Supérieur', 'Sneakers de collection', 16, 'assets/img/niveau/niveau_69efe1a6edaaa.jpg'),
(36, 'Niveau Inférieur', 'Baskets de tous les jours', 16, 'assets/img/niveau/niveau_69efe1e992878.jpg'),
(37, 'Penderie', 'Vestes en cuir, manteaux sombres', 17, 'assets/img/niveau/niveau_69efe276480b0.jpg'),
(38, 'Étagères', 'T-shirts de groupes, hauts résille', 17, 'assets/img/niveau/niveau_69efe24cc57de.jpg'),
(39, 'Tiroirs bas', 'Jeans skinny déchirés, pantalons à clous', 17, 'assets/img/niveau/niveau_69efe2b44c55d.jpg'),
(40, 'Tiroir du haut', 'Bracelets à clous, chaînes, bagues', 18, 'assets/img/niveau/niveau_69efe33ca8b74.jpg'),
(41, 'Tiroir d''en bas', 'Ceintures cloutées, mitaines', 18, 'assets/img/niveau/niveau_69efe3065ba71.jpg'),
(42, 'Niveau Supérieur', 'Bottes à plateformes et creepers', 19, 'assets/img/niveau/niveau_69efe3a188e05.jpg'),
(43, 'Niveau Inférieur', 'Converse et Vans usées', 19, 'assets/img/niveau/niveau_69efe3711a3d2.jpg'),
(44, 'Penderie', 'Robes de cocktail, vestes brillantes', 20, 'assets/img/niveau/niveau_69efe59521e7a.jpg'),
(45, 'Étagères', 'Hauts de soirée, tops à paillettes', 20, 'assets/img/niveau/niveau_69efe53160533.jpg'),
(46, 'Tiroirs bas', 'Pantalons en simili cuir, jupes courtes', 20, 'assets/img/niveau/niveau_69efe5eb5050f.jpg'),
(47, 'Tiroir du haut', 'Parures complètes, boucles d''oreilles', 21, 'assets/img/niveau/niveau_69efe67d4a067.jpg'),
(48, 'Tiroir d''en bas', 'Petites pochettes de soirée', 21, 'assets/img/niveau/niveau_69efe643e636b.jpg'),
(49, 'Niveau Supérieur', 'Talons hauts et stilettos', 22, 'assets/img/niveau/niveau_69efe3d7b7d5a.jpg'),
(50, 'Niveau Inférieur', 'Chaussures de danse', 22, 'assets/img/niveau/niveau_69efe40cc66c0.jpg'),
(51, 'Penderie', 'Manteaux rétro, vestes en velours côtelé', 23, 'assets/img/niveau/niveau_69efe70393eab.jpg'),
(52, 'Étagères', 'Chemisiers anciens, tricots', 23, 'assets/img/niveau/niveau_69efe6e656af0.jpg'),
(53, 'Tiroirs bas', 'Pantalons patte d''éléphant', 23, 'assets/img/niveau/niveau_69efe75bf41b6.jpg'),
(54, 'Tiroir du haut', 'Broches, montres à gousset, colliers de perles', 24, 'assets/img/niveau/niveau_69efe6ae2bb9b.jpg'),
(55, 'Tiroir d''en bas', 'Sacs rétro en cuir, gants en dentelle', 24, 'assets/img/niveau/niveau_69efe7838a780.jpg'),
(56, 'Niveau Supérieur', 'Chaussures à boucles', 25, 'assets/img/niveau/niveau_69efe831896d0.jpg'),
(57, 'Niveau Inférieur', 'Bottes vintage', 25, 'assets/img/niveau/niveau_69efe7c2cdf1b.jpg'),
(58, 'Penderie', 'Vestes en jean, survêtements en velours', 26, 'assets/img/niveau/niveau_69efea3b528b6.jpg'),
(59, 'Étagères', 'Crop tops, t-shirts à strass', 26, 'assets/img/niveau/niveau_69efe8bbeff96.jpg'),
(60, 'Tiroirs bas', 'Jeans taille basse, mini-jupes plissées', 26, 'assets/img/niveau/niveau_69efea921b17f.jpg'),
(61, 'Tiroir du haut', 'Chokers, pinces papillon, lunettes colorées', 27, 'assets/img/niveau/niveau_69efeb2997a28.jpg'),
(62, 'Tiroir d''en bas', 'Sacs baguette, ceintures chaînes', 27, 'assets/img/niveau/niveau_69efeac88737d.jpg'),
(63, 'Niveau Supérieur', 'Sneakers chunky, Bottes Ugg', 28, 'assets/img/niveau/niveau_69efeb7f121a8.jpg'),
(64, 'Niveau Inférieur', 'Chaussures compensées, talons', 28, 'assets/img/niveau/niveau_69efe86d94469.jpg'),
(65, 'Penderie', 'Vestes et manteaux divers', 29, 'assets/img/niveau/niveau_69efebd1b97e9.jpg'),
(66, 'Étagères', 'Hauts et pulls divers', 29, 'assets/img/niveau/niveau_69efeba5944ad.jpg'),
(67, 'Tiroirs bas', 'Pantalons et shorts divers', 29, 'assets/img/niveau/niveau_69efec05010b9.jpg'),
(68, 'Tiroir du haut', 'Bijoux en vrac', 30, 'assets/img/niveau/niveau_69efec5507481.jpg'),
(69, 'Tiroir d''en bas', 'Sacs et accessoires divers', 30, 'assets/img/niveau/niveau_69efec33854d7.jpg'),
(70, 'Niveau Supérieur', 'Chaussures avec talons divers', 31, 'assets/img/niveau/niveau_69efec8d87e0c.jpg'),
(71, 'Niveau Inférieur', 'Chaussures basses diverses', 31, 'assets/img/niveau/niveau_69efec7658f03.jpg');

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
(1, 'Talons hauts bottines', '38', 'Chaussures', 'Rose', 'Disponible', 'femme', 'Sans marque', 'assets/img/wardrobe/v_69fcd1b2682df.jpg', 5, 64, 1, 'Super comfortable !'),
(2, 'Bracelet Vancleef', 'TU', 'Bracelet', 'Doré', 'Disponible', 'Femme', 'VanCleef', 'assets/img/wardrobe/v_69fcd3637ab36.jpg', 7, 12, 1, 'Ajout parfait à votre tenue chic !');