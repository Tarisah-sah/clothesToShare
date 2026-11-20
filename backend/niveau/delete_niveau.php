<?php
session_start();
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') { exit; }
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['idNiveau'] ?? null;
if (!$id || $id == 1) exit; 

try {
    $conn = pdo_connectDB();

    $stmtPhoto = $conn->prepare("SELECT photo FROM niveau WHERE idNiveau = ?");
    $stmtPhoto->execute([$id]);
    $niveau = $stmtPhoto->fetch(PDO::FETCH_ASSOC);

    // On déplace les habits et on supprime le niveau
    $conn->prepare("UPDATE vetement SET idniveau = 1 WHERE idniveau = ?")->execute([$id]);
    $conn->prepare("DELETE FROM niveau WHERE idNiveau = ?")->execute([$id]);

    if ($niveau && !empty($niveau['photo'])) {
        $cheminPhysique = '../../' . $niveau['photo'];
        if (file_exists($cheminPhysique)) {
            unlink($cheminPhysique); 
        }
    }
    
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la suppression du niveau.']); 
}
?>