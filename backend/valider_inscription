<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);
include('connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $id     = intval($data['idutilisateur'] ?? 0);
    $action = $data['action'] ?? '';

    if (!$id || !in_array($action, ['accepter', 'refuser'])) {
        echo json_encode(['status' => 'error', 'message' => 'Données invalides. id=' . $id . ' action=' . $action]);
        exit;
    }

    try {
        if ($action === 'accepter') {
            $stmt = $conn->prepare("UPDATE utilisateur SET role = 'user' WHERE idutilisateur = :id AND role = 'pending'");
            $stmt->execute([':id' => $id]);
            echo json_encode(['status' => 'success', 'message' => 'Utilisateur accepté.', 'rows' => $stmt->rowCount()]);
        } else {
            $stmt = $conn->prepare("DELETE FROM utilisateur WHERE idutilisateur = :id AND role = 'pending'");
            $stmt->execute([':id' => $id]);
            echo json_encode(['status' => 'success', 'message' => 'Demande refusée.', 'rows' => $stmt->rowCount()]);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée : ' . $_SERVER['REQUEST_METHOD']]);
}

$conn = null;
?>