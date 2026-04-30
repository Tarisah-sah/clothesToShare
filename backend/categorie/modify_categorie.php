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
    $id = $_POST['idcategorie'] ?? null;
    $nom = trim($_POST['nom'] ?? '');
    $infoPlus = trim($_POST['infoPlus'] ?? '');

    if (!$id || empty($nom)) {
        echo json_encode(['status' => 'error', 'message' => 'ID ou nom manquant.']);
        exit;
    }

    try {
        $stmt = $conn->prepare("UPDATE categorie SET nom = :nom, infoPlus = :infoPlus WHERE idcategorie = :id");
        $stmt->execute([':nom' => $nom, ':infoPlus' => $infoPlus, ':id' => $id]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la modification de la catégorie.']);
    }
}
$conn = null;
?>