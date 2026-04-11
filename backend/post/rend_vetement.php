<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// Afficher tous les vetements qui correspond a la recherche
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $vetement_idvetement = $_POST['idvetement'];
    $commentaire = $_POST['commentaire'];
    
    $conn->beginTransaction();
    try {
        // 1. Modifier l'état du vêtement à "Au lavage"
        $vetementRendSQL = "UPDATE vetement SET etat = 'Au lavage' WHERE idvetement = ?";
        $stmt = $conn->prepare($vetementRendSQL);
        $stmt->execute([$vetement_idvetement]);

        // 2. Mettre à jour la table "pret" avec la date de fin réelle et le commentaire
        $pretUpdateSQL = "UPDATE pret 
            SET datefinreelle = NOW(), commentaire = :commentaire, statutpret = 'Rendu' 
            WHERE idvetement = :idvetement AND statutpret IN ('En prêt', 'Retour en attente')";
        $stmt = $conn->prepare($pretUpdateSQL);
        $stmt->execute([
            ':commentaire' => $commentaire,
            ':idvetement' => $vetement_idvetement
        ]);

        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

$conn=null;
?>