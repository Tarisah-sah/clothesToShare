<?php
session_start();
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') { exit; }
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['idSite'] ?? null;
if (!$id || $id == 1) exit; 

try {
    $conn = pdo_connectDB();

    $stmtPhoto = $conn->prepare("SELECT photo FROM site WHERE idSite = ?");
    $stmtPhoto->execute([$id]);
    $site = $stmtPhoto->fetch(PDO::FETCH_ASSOC);
    
    // 1. Sauver les vêtements
    $conn->prepare("UPDATE vetement v JOIN niveau n ON v.idniveau = n.idNiveau JOIN rangement r ON n.idRangement = r.idRangement JOIN local l ON r.idLocal = l.idLocal SET v.idniveau = 1 WHERE l.idSite = ?")->execute([$id]);
    // 2. Détruire les niveaux
    $conn->prepare("DELETE n FROM niveau n JOIN rangement r ON n.idRangement = r.idRangement JOIN local l ON r.idLocal = l.idLocal WHERE l.idSite = ?")->execute([$id]);
    // 3. Détruire les rangements
    $conn->prepare("DELETE r FROM rangement r JOIN local l ON r.idLocal = l.idLocal WHERE l.idSite = ?")->execute([$id]);
    // 4. Détruire les locaux
    $conn->prepare("DELETE FROM local WHERE idSite = ?")->execute([$id]);
    // 5. Détruire le site
    $conn->prepare("DELETE FROM site WHERE idSite = ?")->execute([$id]);
    
    // On supprime le vrai fichier image du disque dur !
    if ($site && !empty($site['photo'])) {
        $cheminPhysique = '../../' . $site['photo'];
        if (file_exists($cheminPhysique)) {
            unlink($cheminPhysique); 
        }
    }

    echo json_encode(['status' => 'success']);
} catch (Exception $e) { 
    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la suppression du site.']); 
}
?>