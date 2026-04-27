<?php
session_start();
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') { exit; }
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['idRangement'] ?? null;
if (!$id || $id == 1) exit; 

try {
    $conn = pdo_connectDB();

    // ---> AJOUT 1 : On récupère l'image du rangement AVANT de le détruire
    $stmtPhoto = $conn->prepare("SELECT photo FROM rangement WHERE idRangement = ?");
    $stmtPhoto->execute([$id]);
    $rangement = $stmtPhoto->fetch(PDO::FETCH_ASSOC);

    // 1. Sauver les vêtements des niveaux de ce rangement
    $conn->prepare("UPDATE vetement v JOIN niveau n ON v.idniveau = n.idNiveau SET v.idniveau = 1 WHERE n.idRangement = ?")->execute([$id]);
    // 2. Détruire les niveaux enfants
    $conn->prepare("DELETE FROM niveau WHERE idRangement = ?")->execute([$id]);
    // 3. Détruire le rangement
    $conn->prepare("DELETE FROM rangement WHERE idRangement = ?")->execute([$id]);
    
    // ---> AJOUT 2 : On supprime le vrai fichier image du disque dur !
    if ($rangement && !empty($rangement['photo'])) {
        $cheminPhysique = '../../' . $rangement['photo'];
        if (file_exists($cheminPhysique)) {
            unlink($cheminPhysique); 
        }
    }

    echo json_encode(['status' => 'success']);
} catch (Exception $e) { echo json_encode(['status' => 'error', 'message' => $e->getMessage()]); }
?>