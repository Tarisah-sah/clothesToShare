<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB(); 

// Afficher les details d'un utilisateur
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $conn->beginTransaction();
    $idvetement = $_DELETE['idvetement'];
    try {
        $stmt = $conn->prepare("DELETE FROM vetement WHERE idvetement = ?");
        $stmt->execute([$idvetement]);

        $conn->commit();
        $response = [
            "deleted" => $stmt->rowCount() > 0,
            "count"   => $stmt->rowCount(),
            "id"      => $idvetement
        ];
    } catch (Exception $e) {
        $conn->rollBack();
        $response = [
            "error" => true,
            "message" => $e->getMessage()
        ];
    }
}

$conn=null;
?>