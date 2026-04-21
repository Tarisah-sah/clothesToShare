<?php
session_start();
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé. Réservé aux administrateurs.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');
$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nom = trim($_POST['nom'] ?? '');
    $infoLocal = trim($_POST['infoLocal'] ?? '');
    $idSite = $_POST['idSite'] ?? 1; // Par défaut 1 si tu n'as qu'un seul site pour l'instant

    if (empty($nom)) {
        echo json_encode(['status' => 'error', 'message' => 'Le nom du local est obligatoire.']);
        exit;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO local (nom, infoLocal, idSite) VALUES (:nom, :infoLocal, :idSite)");
        $stmt->execute([':nom' => $nom, ':infoLocal' => $infoLocal, ':idSite' => $idSite]);
        
        echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>