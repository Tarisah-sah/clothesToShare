<?php
session_start();

// Vérifier les droits
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
    $id = $data['idcategorie'] ?? null;

    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'ID manquant.']);
        exit;
    }

    try {
        // On vérifie si des vêtements utilisent cette catégorie
        $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM vetement WHERE idcategorie = ?");
        $stmtCheck->execute([$id]);
        if ($stmtCheck->fetchColumn() > 0) {
            echo json_encode(['status' => 'error', 'message' => 'Impossible de supprimer : des vêtements utilisent cette catégorie.']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM categorie WHERE idcategorie = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la suppression de la catégorie.']);
    }
}
$conn = null;
?>