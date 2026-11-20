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

if (!$id) {
    echo json_encode(['status' => 'error', 'message' => 'ID manquant.']);
    exit;
}

if ($id == $_SESSION['idutilisateur']) {
    echo json_encode(['status' => 'error', 'message' => 'Tu ne peux pas te supprimer toi-même !']);
    exit;
}

try {
    $conn = pdo_connectDB();
    $stmt = $conn->prepare("DELETE FROM utilisateur WHERE idutilisateur = ?");
    $stmt->execute([$id]);
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    // S'il a encore des vêtements enregistrés ou des prêts en cours, on bloquera la suppression
    echo json_encode(['status' => 'error', 'message' => 'Impossible de supprimer ce compte : l\'utilisateur possède ou emprunte encore des vêtements.']);
}
?>