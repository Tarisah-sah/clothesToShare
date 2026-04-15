<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB(); 

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // 1. Récupérer les données envoyées en JSON
    $data = json_decode(file_get_contents("php://input"), true);
    
    // 2. Vérifier si l'ID est dans le JSON, sinon vérifier dans l'URL ($_GET)
    $idlocal = $data['idlocal'] ?? $_GET['idlocal'] ?? null;

    if (!$idlocal) {
        echo json_encode(["status" => "error", "message" => "L'ID du local est manquant."]);
        exit;
    }

    $conn->beginTransaction();
    try {
        // supprimer le local et tous les éléments associés grâce aux contraintes de clé étrangère avec ON DELETE CASCADE
        $stmt = $conn->prepare("DELETE FROM local WHERE idLocal = ?");
        $stmt->execute([$idlocal]);

        $conn->commit();
        echo json_encode([
            "status"  => "success",
            "deleted" => $stmt->rowCount() > 0,
            "count"   => $stmt->rowCount(),
            "id"      => $idlocal
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