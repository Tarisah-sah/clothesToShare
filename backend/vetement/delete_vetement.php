<?php
session_start();

// SÉCURITÉ : On bloque immédiatement si la personne n'est pas connectée OU si elle n'a que le rôle "user"
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] === 'user') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé. Ton rôle ne te permet pas de modifier la garde-robe.']);
    exit;
}
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB(); 

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $idvetement = $data['idvetement'] ?? $_GET['idvetement'] ?? null;

    if (!$idvetement) {
        echo json_encode(["status" => "error", "message" => "L'ID du vêtement est manquant."]);
        exit;
    }

    try {
        // --- SÉCURITÉ : VÉRIFICATION DU PROPRIÉTAIRE ---
        // On cherche le propriétaire actuel de ce vêtement
        $stmtCheck = $conn->prepare("SELECT idproprietaire FROM vetement WHERE idvetement = ?");
        $stmtCheck->execute([$idvetement]);
        $proprio = $stmtCheck->fetchColumn();

        // Si ce n'est pas le sien ET qu'il n'est pas admin -> DEHORS !
        if ($proprio != $_SESSION['idutilisateur'] && $_SESSION['role'] !== 'admin') {
            echo json_encode(["status" => "error", "message" => "Tu n'as pas le droit de supprimer ce vêtement."]);
            exit;
        }
        // -----------------------------------------------

        $conn->beginTransaction();
        $stmt = $conn->prepare("DELETE FROM vetement WHERE idvetement = ?");
        $stmt->execute([$idvetement]);

        $conn->commit();
        echo json_encode([
            "status"  => "success",
            "deleted" => $stmt->rowCount() > 0
        ]);
    } catch (Exception $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée.']);
}

$conn = null;
?>