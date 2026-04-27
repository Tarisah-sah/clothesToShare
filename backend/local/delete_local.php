<?php
session_start();
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') { exit; }
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['idLocal'] ?? null;
if (!$id || $id == 1) exit; 

try {
    $conn = pdo_connectDB();
    
    // ---> AJOUT 1 : On récupère l'image du local AVANT de le détruire
    $stmtPhoto = $conn->prepare("SELECT photo FROM local WHERE idLocal = ?");
    $stmtPhoto->execute([$id]);
    $local = $stmtPhoto->fetch(PDO::FETCH_ASSOC);
    
    // Ton excellente logique de sauvegarde et suppression en cascade :
    $conn->prepare("UPDATE vetement v JOIN niveau n ON v.idniveau = n.idNiveau JOIN rangement r ON n.idRangement = r.idRangement SET v.idniveau = 1 WHERE r.idLocal = ?")->execute([$id]);
    $conn->prepare("DELETE n FROM niveau n JOIN rangement r ON n.idRangement = r.idRangement WHERE r.idLocal = ?")->execute([$id]);
    $conn->prepare("DELETE FROM rangement WHERE idLocal = ?")->execute([$id]);
    $conn->prepare("DELETE FROM local WHERE idLocal = ?")->execute([$id]);
    
    // ---> AJOUT 2 : On supprime le vrai fichier image du disque dur !
    if ($local && !empty($local['photo'])) {
        $cheminPhysique = '../../' . $local['photo'];
        if (file_exists($cheminPhysique)) {
            unlink($cheminPhysique); 
        }
    }
    
    echo json_encode(['status' => 'success']);
} catch (Exception $e) { 
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]); 
}
?>