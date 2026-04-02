<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// Afficher tous les vetements qui correspond a la recherche
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$utilisateur_idutilisateur = $_POST['idutilisateur'];

    $conn->beginTransaction();
    try {
        $utilisateurAcceptSQL = "UPDATE utilisateur SET role = 'user' WHERE idutilisateur = ?";
        $stmt = $conn->prepare($utilisateurAcceptSQL);
        $stmt->execute([$utilisateur_idutilisateur]);
        
        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}