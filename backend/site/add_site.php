<?php
session_start();
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé. Réservé aux admins.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');
$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
        $stmt = $conn->prepare("INSERT INTO site (nom, adresse, code_postal, localite) VALUES (:nom, :adresse, :code_postal, :localite)");
        $stmt->execute([':nom' => $nom, ':adresse' => $adresse, ':code_postal' => $code_postal, ':localite' => $localite]);
        
        echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>