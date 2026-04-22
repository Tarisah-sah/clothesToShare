<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

// Petit contrôle de sécurité (optionnel mais conseillé)
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

$conn = pdo_connectDB();
$nom = $_POST['nom'] ?? '';
$infoNiveau = $_POST['infoNiveau'] ?? '';
$idRangement = $_POST['idRangement'] ?? null;

try {
    $sql = "INSERT INTO niveau (nom, infoNiveau, idRangement) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$nom, $infoNiveau, $idRangement]);
    
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>