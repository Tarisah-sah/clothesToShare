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
    $idLocal = $_POST['idLocal'] ?? null;
    $nom = trim($_POST['nom'] ?? '');
    $idSite = trim($_POST['idSite'] ?? '');
    $infoLocal = trim($_POST['infoLocal'] ?? '');

    if (!$idLocal || empty($nom)) {
        echo json_encode(['status' => 'error', 'message' => 'ID ou nom manquant.']);
        exit;
    }

    try {
        $stmt = $conn->prepare("UPDATE local SET nom = :nom, infoLocal = :infoLocal, idSite = :idSite WHERE idLocal = :idLocal");
        $stmt->execute([':nom' => $nom, ':infoLocal' => $infoLocal, ':idLocal' => $idLocal, ':idSite' => $idSite]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>