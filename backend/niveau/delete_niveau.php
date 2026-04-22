<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$idNiveau = $data['idNiveau'] ?? null;

try {
    $conn = pdo_connectDB();
    $sql = "DELETE FROM niveau WHERE idNiveau = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$idNiveau]);
    
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    // Si une erreur survient (ex: des vêtements sont encore rangés à ce niveau)
    echo json_encode(['status' => 'error', 'message' => 'Impossible de supprimer ce niveau. Vérifie qu\'il ne contient plus de vêtements.']);
}
?>