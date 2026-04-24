<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

// SÉCURITÉ ABSOLUE : On vérifie juste que la personne est connectée
if (!isset($_SESSION['idutilisateur'])) {
    echo json_encode(['status' => 'error', 'message' => 'Tu dois être connecté pour faire cela.']);
    exit;
}

// ON NE PREND PAS l'ID du Javascript (trop dangereux) ! 
// On prend l'ID directement dans le coffre-fort du serveur (la session)
$idUtilisateur = $_SESSION['idutilisateur'];

try {
    $conn = pdo_connectDB();
    
    $stmt = $conn->prepare("DELETE FROM utilisateur WHERE idutilisateur = ?");
    $stmt->execute([$idUtilisateur]);
    
    // Si ça a marché, on détruit la session côté serveur
    session_destroy();
    
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    // La base de données va bloquer la suppression si l'utilisateur a encore des vêtements ou des prêts !
    echo json_encode(['status' => 'error', 'message' => 'Impossible de supprimer ton compte. Assure-toi de ne plus posséder ou emprunter de vêtements.']);
}
?>