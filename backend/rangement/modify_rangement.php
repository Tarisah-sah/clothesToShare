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
    $idRangement = $_POST['idRangement'] ?? null;
    $nom = trim($_POST['nom'] ?? '');
    $infoRangement = trim($_POST['infoRangement'] ?? '');
    $idLocal = $_POST['idLocal'] ?? null;

    if (!$idRangement || empty($nom) || !$idLocal) {
        echo json_encode(['status' => 'error', 'message' => 'Données incomplètes.']);
        exit;
    }

    try {
        $stmt = $conn->prepare("UPDATE rangement SET nom = :nom, infoRangement = :infoRangement, idLocal = :idLocal WHERE idRangement = :idRangement");
        $stmt->execute([':nom' => $nom, ':infoRangement' => $infoRangement, ':idLocal' => $idLocal, ':idRangement' => $idRangement]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>