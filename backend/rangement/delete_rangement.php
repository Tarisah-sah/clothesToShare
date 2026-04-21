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

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $idRangement = $data['idRangement'] ?? null;

    if (!$idRangement) {
        echo json_encode(['status' => 'error', 'message' => 'ID manquant.']);
        exit;
    }

    try {
        // Sécurité : On vérifie si des niveaux utilisent ce rangement
        $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM niveau WHERE idRangement = ?");
        $stmtCheck->execute([$idRangement]);
        if ($stmtCheck->fetchColumn() > 0) {
            echo json_encode(['status' => 'error', 'message' => 'Impossible de supprimer : ce rangement contient encore des niveaux.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM rangement WHERE idRangement = ?");
        $stmt->execute([$idRangement]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>