<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// Afficher tous les vetements qui correspond a la recherche
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $vetement_idvetement = $_POST['idvetement'];
    $utilisateur_idutilisateur = $_POST['idutilisateur'];
    $statutpret = 'En prêt';
    
    $conn->beginTransaction();
    try {
        // 1. Modifier l'état du vêtement à "En prêt"
        $vetementPretSQL = "UPDATE vetement SET etat = 'En prêt' WHERE idvetement = ?";
        $stmt = $conn->prepare($vetementPretSQL);
        $stmt->execute([$vetement_idvetement]);

        // 2. Insérer une nouvelle entrée dans la table "pret"
        $pretInsertSQL = "INSERT INTO 
            pret (idvetement, idemprunteur, datedebut, datefinprevue, statutpret) 
            VALUES (:idvetement, :idemprunteur, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), :statutpret)";
        $stmt = $conn->prepare($pretInsertSQL);
        $stmt->execute([
            ':idvetement' => $vetement_idvetement,
            ':idemprunteur' => $utilisateur_idutilisateur,
            ':statutpret' => $statutpret
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