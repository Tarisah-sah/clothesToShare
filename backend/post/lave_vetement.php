<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// Afficher tous les vetements qui correspond a la recherche
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $vetement_idvetement = $_POST['idvetement'];
    
    $conn->beginTransaction();
    try {
        $vetementLaveSQL = "UPDATE vetement SET etat = 'Disponible' WHERE idvetement = ? AND etat LIKE 'Au lavage'";
        $stmt = $conn->prepare($vetementLaveSQL);
        $stmt->execute([$vetement_idvetement]);
        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

$conn=null;
?>