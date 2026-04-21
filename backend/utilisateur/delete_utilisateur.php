<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB(); 

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // 1. Récupérer les données envoyées en JSON
    $data = json_decode(file_get_contents("php://input"), true);
    
    // 2. Vérifier si l'ID est dans le JSON, sinon vérifier dans l'URL ($_GET)
    $idutil = $data['idutilisateur'] ?? $_GET['idutilisateur'] ?? null;

    if (!$idutil) {
        echo json_encode(["status" => "error", "message" => "L'ID de l'utilisateur est manquant."]);
        exit;
    }

    $conn->beginTransaction();
    try {
        $stmt = $conn->prepare("DELETE FROM utilisateur WHERE idutilisateur = ?");
        $stmt->execute([$idutil]);

        $conn->commit();
        echo json_encode([
            "status"  => "success",
            "deleted" => $stmt->rowCount() > 0,
            "count"   => $stmt->rowCount(),
            "id"      => $idutil
        ]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode([
            "status"  => "error",
            "message" => $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée.']);
}

$conn = null;
?>