<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $vetement_idvetement = $_POST['idvetement'];
    $utilisateur_idutilisateur = $_POST['idutilisateur'];
    $vetement_datefinpret = $_POST['datefinpret'];
    
    // NOUVEAUTÉ : Le prêt commence en "En attente" et le vêtement en "Demande en cours"
    $statutpret = 'En attente'; 
    $etat_vetement = 'Demande en cours';
    
    $conn->beginTransaction();
    try {
        // 1. Modifier l'état du vêtement à "Demande en cours"
        $vetementPretSQL = "UPDATE vetement SET etat = ? WHERE idvetement = ?";
        $stmt = $conn->prepare($vetementPretSQL);
        $stmt->execute([$etat_vetement, $vetement_idvetement]);

        // 2. Préparer les données pour l'insertion dans la table "pret"
        $sqlExecuter = [
            ':idvetement' => $vetement_idvetement,
            ':idemprunteur' => $utilisateur_idutilisateur,
            ':statutpret' => $statutpret
        ];
        if (isset($vetement_datefinpret) && !empty($vetement_datefinpret)) {
            $sqlExecuter[':datefinprevue'] = $vetement_datefinpret; // On garde le format DATE (YYYY-MM-DD)
            $pretInsertSQL = "INSERT INTO 
                pret (idvetement, idemprunteur, datefinprevue, statutpret) 
                VALUES (:idvetement, :idemprunteur, :datefinprevue, :statutpret)";
        } else {
            $pretInsertSQL = "INSERT INTO 
                pret (idvetement, idemprunteur, statutpret) 
                VALUES (:idvetement, :idemprunteur, :statutpret)";
        }

        // 3. Insérer une nouvelle entrée dans la table "pret"
        $stmt = $conn->prepare($pretInsertSQL);
        $stmt->execute($sqlExecuter);

        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

$conn=null;
?>