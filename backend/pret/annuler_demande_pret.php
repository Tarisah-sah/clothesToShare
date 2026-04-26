<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idVetement = $_POST['idvetement'] ?? null;
    $idUtilisateur = $_POST['idutilisateur'] ?? null;

    if (!$idVetement || !$idUtilisateur) {
        echo json_encode(['status' => 'error', 'message' => 'Données manquantes']);
        exit;
    }

    $conn = pdo_connectDB();
    $conn->beginTransaction();

    try {
        // 1. On supprime la demande de prêt uniquement si elle est "En attente"
        $sqlDeletePret = "DELETE FROM pret WHERE idvetement = :idv AND idemprunteur = :idu AND statutpret = 'En attente'";
        $stmt = $conn->prepare($sqlDeletePret);
        $stmt->execute([':idv' => $idVetement, ':idu' => $idUtilisateur]);

        // Si une ligne a bien été supprimée, on libère le vêtement
        if ($stmt->rowCount() > 0) {
            $sqlUpdateVetement = "UPDATE vetement SET etat = 'Disponible' WHERE idvetement = :idv";
            $stmtUpdate = $conn->prepare($sqlUpdateVetement);
            $stmtUpdate->execute([':idv' => $idVetement]);

            $conn->commit();
            echo json_encode(['status' => 'success']);
        } else {
            $conn->rollBack();
            echo json_encode(['status' => 'error', 'message' => 'Impossible d\'annuler cette demande.']);
        }
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    $conn = null;
}
?>