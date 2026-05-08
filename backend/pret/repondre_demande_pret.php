<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idvetement = $_POST['idvetement'];
    $action = $_POST['action']; // Peut être 'accepter' ou 'refuser'

    $conn->beginTransaction();
    try {
        if ($action === 'accepter') {
            // Le propriétaire accepte : le vêtement passe "En prêt", et le prêt passe à "En prêt"
            $stmt = $conn->prepare("UPDATE vetement SET etat = 'En prêt' WHERE idvetement = ?");
            $stmt->execute([$idvetement]);
            
            $stmt2 = $conn->prepare("UPDATE pret SET statutpret = 'En prêt', datedebut = NOW() WHERE idvetement = ? AND statutpret = 'En attente'");
            $stmt2->execute([$idvetement]);
            
        } else if ($action === 'refuser') {
            // Le propriétaire refuse : le vêtement redevient "Disponible"
            $stmt = $conn->prepare("UPDATE vetement SET etat = 'Disponible' WHERE idvetement = ?");
            $stmt->execute([$idvetement]);
            
            // On supprime purement et simplement la ligne de la demande de prêt
            $stmt2 = $conn->prepare("DELETE FROM pret WHERE idvetement = ? AND statutpret = 'En attente'");
            $stmt2->execute([$idvetement]);
        }

        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

$conn=null;
?>