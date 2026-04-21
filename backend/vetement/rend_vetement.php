<?php
session_start();

if (!isset($_SESSION['idutilisateur'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Non autorisé.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $vetement_idvetement = $_POST['idvetement'];
    $commentaire = $_POST['commentaire'] ?? '';
    
    try {
        // SÉCURITÉ : Vérifier que c'est bien le propriétaire (ou un admin)
        $stmtCheck = $conn->prepare("SELECT idproprietaire FROM vetement WHERE idvetement = ?");
        $stmtCheck->execute([$vetement_idvetement]);
        $proprio = $stmtCheck->fetchColumn();

        if ($proprio != $_SESSION['idutilisateur'] && $_SESSION['role'] !== 'admin') {
            echo json_encode(['status' => 'error', 'message' => 'Seul le propriétaire peut valider le retour.']);
            exit;
        }

        $conn->beginTransaction();
        
        $vetementRendSQL = "UPDATE vetement SET etat = 'Au lavage' WHERE idvetement = ?";
        $stmt = $conn->prepare($vetementRendSQL);
        $stmt->execute([$vetement_idvetement]);

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
        if ($conn->inTransaction()) $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>