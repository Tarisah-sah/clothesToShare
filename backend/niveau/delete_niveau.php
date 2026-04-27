<?php
session_start();
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') { exit; }
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['idNiveau'] ?? null;
if (!$id || $id == 1) exit; // Sécurité : On ne supprime pas le garde tout

try {
    $conn = pdo_connectDB();

    // ---> AJOUT 1 : On récupère l'image du niveau AVANT de le détruire
    $stmtPhoto = $conn->prepare("SELECT photo FROM niveau WHERE idNiveau = ?");
    $stmtPhoto->execute([$id]);
    $niveau = $stmtPhoto->fetch(PDO::FETCH_ASSOC);

    // 1. Sauver les vêtements vers le Niveau 1
    $conn->prepare("UPDATE vetement SET idniveau = 1 WHERE idniveau = ?")->execute([$id]);
    // 2. Détruire le niveau
    $conn->prepare("DELETE FROM niveau WHERE idNiveau = ?")->execute([$id]);

    // ---> AJOUT 2 : On supprime le vrai fichier image du disque dur !
    if ($niveau && !empty($niveau['photo'])) {
        $cheminPhysique = '../../' . $niveau['photo'];
        if (file_exists($cheminPhysique)) {
            unlink($cheminPhysique); 
        }
    }
    
    echo json_encode(['status' => 'success']);
} catch (Exception $e) { echo json_encode(['status' => 'error', 'message' => $e->getMessage()]); }
?>