<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

// Vérification de sécurité basique
if (!isset($_SESSION['idutilisateur'])) {
    echo json_encode(['status' => 'error', 'message' => 'Non autorisé.']);
    exit;
}

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idVetement = $_POST['idvetement'] ?? null;

    if ($idVetement) {
        try {
            // 1. AVANT de supprimer, on récupère le chemin de la photo
            $stmtInfo = $conn->prepare("SELECT photo FROM vetement WHERE idvetement = :id");
            $stmtInfo->execute([':id' => $idVetement]);
            $vetement = $stmtInfo->fetch(PDO::FETCH_ASSOC);

            // 2. On supprime le vêtement de la base de données
            $stmtDelete = $conn->prepare("DELETE FROM vetement WHERE idvetement = :id");
            
            if ($stmtDelete->execute([':id' => $idVetement])) {
                
                // 3. LA NOUVEAUTÉ : On efface le vrai fichier image du serveur s'il existe
                if ($vetement && !empty($vetement['photo'])) {
                    $cheminPhysique = '../../' . $vetement['photo'];
                    if (file_exists($cheminPhysique)) {
                        unlink($cheminPhysique); // unlink = fonction PHP pour effacer un fichier
                    }
                }
                
                echo json_encode(['status' => 'success']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Échec de la suppression en base.']);
            }
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'ID du vêtement manquant.']);
    }
}
$conn = null;
?>