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
    $idLocal = $data['idLocal'] ?? null;

    if (!$idLocal) {
        echo json_encode(['status' => 'error', 'message' => 'ID manquant.']);
        exit;
    }

    try {
        // Sécurité : On vérifie si des rangements utilisent ce local
        $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM rangement WHERE idLocal = ?");
        $stmtCheck->execute([$idLocal]);
        if ($stmtCheck->fetchColumn() > 0) {
            echo json_encode(['status' => 'error', 'message' => 'Impossible de supprimer : ce local contient encore des rangements.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM local WHERE idLocal = ?");
        $stmt->execute([$idLocal]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>