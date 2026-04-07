<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// Afficher tous les vetements qui correspond a la recherche
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$vetement_new = $_POST['vetement_new'];
	
    $conn->beginTransaction();
    try {
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === 0) {
            $vetement_chemin = 'assets/img/wardrobe/' . $_FILES['photo']['name'];
        } else {
            throw new Exception('Erreur lors du téléchargement de la photo');
        }

        // insère le nouveau vetement dans la base de données
        $vetementAjoutSQL = "INSERT INTO 
            vetement (nom, taille, type, description, couleur, etat, genre, marque, photo, idcategorie, idniveau, idproprietaire) VALUES 
            (:nom, :taille, :type, :description, :couleur, :etat, :genre, :marque, :photo, :idcategorie, :idniveau, :idproprietaire)
        ";
        $stmt = $conn->prepare($vetementAjoutSQL);
        $stmt->execute([
            ':nom' => $vetement_new['nom'],
            ':taille' => $vetement_new['taille'],
            ':type' => $vetement_new['type'],
            ':description' => $vetement_new['description'],
            ':couleur' => $vetement_new['couleur'],
            ':etat' => $vetement_new['etat'],
            ':genre' => $vetement_new['genre'],
            ':marque' => $vetement_new['marque'],
            ':photo' => $vetement_chemin,
            ':idcategorie' => $vetement_new['idcategorie'],
            ':idniveau' => $vetement_new['idniveau'],
            ':idproprietaire' => $vetement_new['idproprietaire']
        ]);
        
        // Récupère l'ID du nouveau vetement inséré
        $id_newVetement = $conn->lastInsertId();
        move_uploaded_file($_FILES['photo']['tmp_name'], $vetement_chemin);
        $conn->commit();
        echo json_encode(['status' => 'success', 'id' => $id_newVetement]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

$conn=null;
?>