<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// Afficher tous les vetements qui correspond a la recherche
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $vetement_idvetement = $_POST['idvetement'];
    $utilisateur_idutilisateur = $_POST['idutilisateur'];
    $vetement_datefinpret = $_POST['datefinpret'];
    $statutpret = 'En attente';
    
    $conn->beginTransaction();
    try {
        // 1. Modifier l'état du vêtement à "En attente"
        $vetementPretSQL = "UPDATE vetement SET etat = ? WHERE idvetement = ?";
        $stmt = $conn->prepare($vetementPretSQL);
        $stmt->execute([$statutpret, $vetement_idvetement]);

        // 2. Ajouter l'heure courante à la date de fin preuve du prêt
        if (isset($vetement_datefinpret)) {
            $datefinnormale = $vetement_datefinpret . ' ' . date('H:i:s');
        } else {
            $datefinnormale = 'DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 MONTH)';
        }

        // 3. Insérer une nouvelle entrée dans la table "pret"
        $pretInsertSQL = "INSERT INTO 
            pret (idvetement, idemprunteur, datefinprevue, statutpret) 
            VALUES (:idvetement, :idemprunteur, :datefinprevue, :statutpret)";
        $stmt = $conn->prepare($pretInsertSQL);
        $stmt->execute([
            ':idvetement' => $vetement_idvetement,
            ':idemprunteur' => $utilisateur_idutilisateur,
            ':statutpret' => $statutpret,
            ':datefinprevue' => $datefinnormale
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