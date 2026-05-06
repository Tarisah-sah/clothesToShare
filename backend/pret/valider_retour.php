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
    $idvetement = $_POST['idvetement'] ?? null;

    if (!$idvetement) {
        echo json_encode(['status' => 'error', 'message' => 'ID du vêtement manquant.']);
        exit;
    }

    try {
        $conn->beginTransaction();

        // 1. On passe le vêtement dans l'état "Au lavage"
        $stmtVet = $conn->prepare("UPDATE vetement SET etat = 'Au lavage' WHERE idvetement = ?");
        $stmtVet->execute([$idvetement]);

        // 2. On clôture le prêt actif dans l'historique
        $stmtPret = $conn->prepare("UPDATE pret SET statutpret = 'Terminé', datefinreelle = NOW() WHERE idvetement = ? AND statutpret IN ('En prêt', 'Retour en attente')");
        $stmtPret->execute([$idvetement]);

        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la validation du retour.']);
    }
}
$conn = null;
?>