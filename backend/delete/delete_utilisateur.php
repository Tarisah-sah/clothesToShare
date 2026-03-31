<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB(); 

// Supprimer un utilisateur
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $conn->beginTransaction();

        $stmt = $conn->prepare("DELETE FROM utilisateur WHERE idutilisateur = ?");
        $stmt->execute([$idutil]);

        $conn->commit();

        $response = [
            "deleted" => $stmt->rowCount() > 0,
            "count"   => $stmt->rowCount(),
            "id"      => $idutil
        ];
    } catch (Exception $e) {
        $conn->rollBack();
        $response = [
            "error" => true,
            "message" => $e->getMessage()
        ];
    }

    echo json_encode($response);
}

$conn=null;
?>