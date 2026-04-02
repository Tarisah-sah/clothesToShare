<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// Afficher tous les vetements qui correspond a la recherche
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$vetement_nom = $_POST['nom'];
	$vetement_taille = $_POST['taille'];
	$vetement_type = $_POST['type'];
	$vetement_description = $_POST['description'];
	$vetement_couleur = $_POST['couleur'];
	$vetement_etat = $_POST['etat'];
	$vetement_genre = $_POST['genre'];
	$vetement_marque = $_POST['marque'];
	$vetement_idcategorie = $_POST['idcategorie'];
	$vetement_idniveau = $_POST['idniveau'];
	$vetement_idproprietaire = $_POST['idproprietaire'];
	$vetement_categorie = $_POST['categorie'];
	$vetement_idvetement = $_POST['idvetement'];

    $conn->beginTransaction();
    try {
        if (isset($_FILES['photo'])) {
            if ($_FILES['photo']['error'] === 0) {
                $vetement_photo = 'assets/img/wardrobe/' . $_FILES['photo']['name'];
            } else {
                throw new Exception('Erreur lors du téléchargement de la photo');
            }
        }

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
        
        move_uploaded_file($_FILES['photo']['tmp_name'], $vetement_photo);
        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

$conn=null;
?>