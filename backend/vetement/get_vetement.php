<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// Afficher le vetement correspondant a l'id
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
	$vetement_id = $_GET['vetement_get'];
	
    $stmt = $conn->prepare("SELECT * FROM vetement WHERE idvetement = ?");
    $stmt->execute([$vetement_id]);
    $vetement = $stmt->fetch();
	
	echo json_encode($vetement);
}

$conn=null;
?>