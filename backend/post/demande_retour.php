<?php
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idvetement = $_POST['idvetement'];
    
    $conn->beginTransaction();
    try {
        // 1. Le vêtement passe en "Retour en attente"
        $stmt = $conn->prepare("UPDATE vetement SET etat = 'Retour en attente' WHERE idvetement = ?");
        $stmt->execute([$idvetement]);

        // 2. Le suivi du prêt passe aussi en "Retour en attente"
        $stmt2 = $conn->prepare("UPDATE pret SET statutpret = 'Retour en attente' WHERE idvetement = ? AND statutpret = 'En prêt'");
        $stmt2->execute([$idvetement]);

        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

$conn = null;
?>