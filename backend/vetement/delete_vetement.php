<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

// Sécurité basique
if (!isset($_SESSION['idutilisateur'])) {
    echo json_encode(['status' => 'error', 'message' => 'Non autorisé.']);
    exit;
}

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $data = json_decode(file_get_contents("php://input"), true);
    $idVetement = $data['idvetement'] ?? ($_POST['idvetement'] ?? null);

    if ($idVetement) {
        try {
            // on récupère le chemin de la photo
            $stmtInfo = $conn->prepare("SELECT photo FROM vetement WHERE idvetement = :id");
            $stmtInfo->execute([':id' => $idVetement]);
            $vetement = $stmtInfo->fetch(PDO::FETCH_ASSOC);

            // On supprime tout l'historique des prêts de ce vêtement
            $stmtDeletePret = $conn->prepare("DELETE FROM pret WHERE idvetement = :id");
            $stmtDeletePret->execute([':id' => $idVetement]);

            // on peut supprime le vêtement de la base de données en toute sécurité
            $stmtDelete = $conn->prepare("DELETE FROM vetement WHERE idvetement = :id");
            
            if ($stmtDelete->execute([':id' => $idVetement])) {
                
                // On efface le vrai fichier image du serveur s'il existe
                if ($vetement && !empty($vetement['photo'])) {
                    $cheminPhysique = '../../' . $vetement['photo'];
                    if (file_exists($cheminPhysique)) {
                        unlink($cheminPhysique); 
                    }
                }
                
                echo json_encode(['status' => 'success']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Échec de la suppression en base.']);
            }
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'Echec de la suppression']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'ID du vêtement manquant.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée.']);
}

$conn = null;
?>