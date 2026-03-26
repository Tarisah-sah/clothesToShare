<?php
include('db_connect.php');

$conn=pdo_connectDB();

// Afficher tous les vetements qui correspond a la recherche
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
	$vetement_recherche = $_GET['vetement_recherche'] ?: '';
	$vetement_motcle = "%" . $vetement_recherche . "%";
	$vetement_categorie = $_GET['vetement_categorie'] ?: 'toutes';
	$vetement_etat = $_GET['vetement_etat'] ?: 'toutes';

    $vetementsCategorieSQL = "SELECT idcategorie FROM categorie WHERE nom LIKE BINARY ?";
    $stmt = $conn->prepare($vetementsCategorieSQL);
    $stmt->execute([$vetement_categorie]);
    $id_categorie = $stmt->fetch();

    if (empty($id_categorie) && $vetement_etat === 'toutes') {
        $vetementsRechercheSQL = "SELECT * FROM vetement WHERE nom LIKE BINARY ?";
        $sqlExe = [$vetement_motcle];
    } else if (empty($id_categorie)) {
        $vetementsRechercheSQL = "SELECT * FROM vetement WHERE nom LIKE BINARY ? AND etat = ?";
        $sqlExe = [$vetement_motcle, $vetement_etat];
    } else if ($vetement_etat === 'toutes') {
        $vetementsRechercheSQL = "SELECT * FROM vetement WHERE nom LIKE BINARY ? AND idcategorie = ?";
        $sqlExe = [$vetement_motcle, $vetement_categorie];
    } else {
        $vetementsRechercheSQL = "SELECT * FROM vetement WHERE nom LIKE BINARY :nom AND etat = :etat AND idcategorie = :categorie";
        $sqlExe = [
            ':nom' => $vetement_motcle,
            ':etat' => $vetement_etat,
            ':categorie' => $vetement_categorie
        ];
    }

    $stmt = $conn->prepare($vetementsRechercheSQL);
    $stmt->execute($sqlExe);
    $vetements = $stmt->fetchAll();
	
	echo json_encode($vetements);
}

$conn=null;
?>