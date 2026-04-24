<?php
session_start();
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');
$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['idSite'] ?? null;
    $nom = trim($_POST['nom'] ?? '');
    $adresse = trim($_POST['adresse'] ?? '');
    $code_postal = trim($_POST['code_postal'] ?? '');
    $localite = trim($_POST['localite'] ?? '');

    if (empty($nom)) {
        echo json_encode(['status' => 'error', 'message' => 'Le nom du site est obligatoire.']);
        exit;
    }

    if (empty($adresse)) {
        echo json_encode(['status' => 'error', 'message' => 'L adresse du site est obligatoire.']);
        exit;
    }

    if (empty($code_postal)) {
        echo json_encode(['status' => 'error', 'message' => 'Le code postal du site est obligatoire.']);
        exit;
    }

    if (empty($localite)) {
        echo json_encode(['status' => 'error', 'message' => 'La localite du site est obligatoire.']);
        exit;
    }

    try {
        $stmt = $conn->prepare("UPDATE site SET nom = :nom, adresse = :adresse, code_postal = :code_postal, localite = :localite WHERE idSite = :id");
        $stmt->execute([':nom' => $nom, ':adresse' => $adresse, ':code_postal' => $code_postal, ':localite' => $localite, ':id' => $id]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>