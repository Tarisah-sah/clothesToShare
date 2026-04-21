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
    $idvetement = $_POST['idvetement'];
    
    try {
        // SÉCURITÉ : Vérifier que celui qui clique est bien l'emprunteur
        $stmtCheck = $conn->prepare("SELECT idemprunteur FROM pret WHERE idvetement = ? AND statutpret = 'En prêt'");
        $stmtCheck->execute([$idvetement]);
        $emprunteur = $stmtCheck->fetchColumn();

        if ($emprunteur != $_SESSION['idutilisateur']) {
            echo json_encode(['status' => 'error', 'message' => 'Tu n\'es pas l\'emprunteur de ce vêtement.']);
            exit;
        }

        $conn->beginTransaction();
        
        $stmt = $conn->prepare("UPDATE vetement SET etat = 'Retour en attente' WHERE idvetement = ?");
        $stmt->execute([$idvetement]);

        $stmt2 = $conn->prepare("UPDATE pret SET statutpret = 'Retour en attente' WHERE idvetement = ? AND statutpret = 'En prêt'");
        $stmt2->execute([$idvetement]);

        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>