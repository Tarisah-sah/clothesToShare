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
    $idSite = $data['idSite'] ?? null;

    if (!$idSite) {
        echo json_encode(['status' => 'error', 'message' => 'ID manquant.']);
        exit;
    }

    try {
        // Sécurité : On vérifie si des locaux utilisent ce site
        $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM local WHERE idSite = ?");
        $stmtCheck->execute([$idSite]);
        if ($stmtCheck->fetchColumn() > 0) {
            echo json_encode(['status' => 'error', 'message' => 'Impossible de supprimer : ce site contient encore des locaux. Assurez vous de transferer les locaux qu il y reste.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM site WHERE idSite = ?");
        $stmt->execute([$idSite]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>