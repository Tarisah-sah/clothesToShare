<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

$conn = pdo_connectDB();
$idNiveau = $_POST['idNiveau'] ?? null;
$nom = $_POST['nom'] ?? '';
$infoNiveau = $_POST['infoNiveau'] ?? '';
$idRangement = $_POST['idRangement'] ?? null;

try {
    $sql = "UPDATE niveau SET nom = ?, infoNiveau = ?, idRangement = ? WHERE idNiveau = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$nom, $infoNiveau, $idRangement, $idNiveau]);
    
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>