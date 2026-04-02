<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// Afficher tous les vetements qui correspond a la recherche
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$vetement_nom = $_POST['vetement_nom'];
	$vetement_taille = $_POST['vetement_taille'];
	$vetement_type = $_POST['vetement_type'];
	$vetement_description = $_POST['vetement_description'];
	$vetement_couleur = $_POST['vetement_couleur'];
	$vetement_etat = $_POST['vetement_etat'];
	$vetement_genre = $_POST['vetement_genre'];
	$vetement_marque = $_POST['vetement_marque'];
	$vetement_photo = $_POST['vetement_photo'];
	$vetement_idcategorie = $_POST['vetement_idcategorie'];
	$vetement_idniveau = $_POST['vetement_idniveau'];
	$vetement_idproprietaire = $_POST['vetement_idproprietaire'];
	$vetement_categorie = $_POST['vetement_categorie'];
	$vetement_idvetement = $_POST['vetement_idvetement'];

    $conn->beginTransaction();
    try {
        $vetementModifSQL = "UPDATE vetement SET 
            nom = :nom, taille = :taille, type = :type, description = :description, couleur = :couleur, etat = :etat, genre = :genre, marque = :marque, photo = :photo, idcategorie = :idcategorie, idniveau = :idniveau, idproprietaire = :idproprietaire 
            WHERE idvetement = :idvetement";
        $stmt = $conn->prepare($vetementModifSQL);
        $stmt->execute([
            ':nom' => $vetement_nom,
            ':taille' => $vetement_taille,
            ':type' => $vetement_type,
            ':description' => $vetement_description,
            ':couleur' => $vetement_couleur,
            ':etat' => $vetement_etat,
            ':genre' => $vetement_genre,
            ':marque' => $vetement_marque,
            ':photo' => $vetement_photo,
            ':idcategorie' => $vetement_idcategorie,
            ':idniveau' => $vetement_idniveau,
            ':idproprietaire' => $vetement_idproprietaire,
            ':idvetement' => $vetement_idvetement
        ]);
        
        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

$conn=null;
?>