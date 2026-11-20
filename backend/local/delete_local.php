<?php
session_start();

// vérif role
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') { exit; }

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

// Récupère les infos du json
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['idLocal'] ?? null;
if (!$id || $id == 1) exit; 

try {
    $conn = pdo_connectDB();
    
    // Récupère le chemin de la photo du local
    $stmtPhoto = $conn->prepare("SELECT photo FROM local WHERE idLocal = ?");
    $stmtPhoto->execute([$id]);
    $local = $stmtPhoto->fetch(PDO::FETCH_ASSOC);
    
    // On déplace les habits et on supprime les rangements et niveaux associés avant de supprimer le local en lui mm
    $conn->prepare("UPDATE vetement v JOIN niveau n ON v.idniveau = n.idNiveau JOIN rangement r ON n.idRangement = r.idRangement SET v.idniveau = 1 WHERE r.idLocal = ?")->execute([$id]);
    $conn->prepare("DELETE n FROM niveau n JOIN rangement r ON n.idRangement = r.idRangement WHERE r.idLocal = ?")->execute([$id]);
    $conn->prepare("DELETE FROM rangement WHERE idLocal = ?")->execute([$id]);
    $conn->prepare("DELETE FROM local WHERE idLocal = ?")->execute([$id]);
    
    // On supprime la photo du dossier assets
    if ($local && !empty($local['photo'])) {
        $cheminPhysique = '../../' . $local['photo'];
        if (file_exists($cheminPhysique)) {
            unlink($cheminPhysique); 
        }
    }
    
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la suppression du local.']); 
}
?>