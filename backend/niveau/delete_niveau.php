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
    // 1. Sauver les vêtements vers le Niveau 1
    $conn->prepare("UPDATE vetement SET idniveau = 1 WHERE idniveau = ?")->execute([$id]);
    // 2. Détruire le niveau
    $conn->prepare("DELETE FROM niveau WHERE idNiveau = ?")->execute([$id]);
    
    echo json_encode(['status' => 'success']);
} catch (Exception $e) { echo json_encode(['status' => 'error', 'message' => $e->getMessage()]); }
?>