<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['idutilisateur'] ?? null;
$role = $data['role'] ?? null;

if (!$id || !$role) {
    echo json_encode(['status' => 'error', 'message' => 'Données manquantes.']);
    exit;
}

// Sécurité supplémentaire : On ne peut pas modifier son propre rôle !
if ($id == $_SESSION['idutilisateur']) {
    echo json_encode(['status' => 'error', 'message' => 'Tu ne peux pas dégrader ton propre compte !']);
    exit;
}

try {
    $conn = pdo_connectDB();
    $stmt = $conn->prepare("UPDATE utilisateur SET role = ? WHERE idutilisateur = ?");
    $stmt->execute([$role, $id]);
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>