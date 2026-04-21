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
    $nom = trim($_POST['nom'] ?? '');
    $infoRangement = trim($_POST['infoRangement'] ?? '');
    $idLocal = $_POST['idLocal'] ?? null;

    if (empty($nom) || !$idLocal) {
        echo json_encode(['status' => 'error', 'message' => 'Le nom et le local sont obligatoires.']);
        exit;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO rangement (nom, infoRangement, idLocal) VALUES (:nom, :infoRangement, :idLocal)");
        $stmt->execute([':nom' => $nom, ':infoRangement' => $infoRangement, ':idLocal' => $idLocal]);
        
        echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>