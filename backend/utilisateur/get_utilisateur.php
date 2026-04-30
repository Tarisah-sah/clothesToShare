<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB(); 

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $idutil = $_GET['id_util'] ?? null;

    if (!$idutil || !is_numeric($idutil)) {
        echo json_encode(["status" => "error", "message" => "ID utilisateur invalide."]);
        exit;
    }

    try {
        $stmt = $conn->prepare("SELECT idutilisateur, email, nom, prenom, adresse, login, role FROM utilisateur WHERE idutilisateur = ?");
        $stmt->execute([$idutil]);
        $utilisateur = $stmt->fetch();
        
        if ($utilisateur) {
            echo json_encode(["status" => "success", "data" => $utilisateur]);
        } else {
            echo json_encode(["status" => "error", "message" => "Utilisateur non trouvé."]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Erreur lors de la récupération des données."]);
    }
}
$conn = null;
?>