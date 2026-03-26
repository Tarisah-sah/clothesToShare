<?php
include('db_connect.php');

$conn=pdo_connectDB();

// Afficher tous les vetements qui correspond a la recherche
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$vetement_new = $_POST['vetement_new'];
	
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
        ':photo' => $vetement_new['photo'],
        ':idcategorie' => $vetement_new['idcategorie'],
        ':idniveau' => $vetement_new['idniveau'],
        ':idproprietaire' => $vetement_new['idproprietaire']
    ]);
	
    $id_newVetement = $conn->lastInsertId();
	echo json_encode($id_newVetement);
}

$conn=null;
?>