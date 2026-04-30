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

    $stmtPhoto = $conn->prepare("SELECT photo FROM rangement WHERE idRangement = ?");
    $stmtPhoto->execute([$id]);
    $rangement = $stmtPhoto->fetch(PDO::FETCH_ASSOC);

    $conn->prepare("UPDATE vetement v JOIN niveau n ON v.idniveau = n.idNiveau SET v.idniveau = 1 WHERE n.idRangement = ?")->execute([$id]);
    $conn->prepare("DELETE FROM niveau WHERE idRangement = ?")->execute([$id]);
    $conn->prepare("DELETE FROM rangement WHERE idRangement = ?")->execute([$id]);
    
    if ($rangement && !empty($rangement['photo'])) {
        $cheminPhysique = '../../' . $rangement['photo'];
        if (file_exists($cheminPhysique)) {
            unlink($cheminPhysique); 
        }
    }

    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la suppression du rangement.']); 
}
?>