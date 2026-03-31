<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB(); 

// Afficher les details d'un utilisateur
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $conn->beginTransaction();
	$idutil = $_GET['id_util'];
	
    $stmt = $conn->prepare("SELECT * FROM utilisateur WHERE idutilisateur = ?");
    $stmt->execute([$idutil]);
    $utilisateur = $stmt->fetchAll();
		
	$conn->commit();
	echo json_encode($utilisateur);
}

$conn=null;
?>