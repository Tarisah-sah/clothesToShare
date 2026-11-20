<?php
header('Content-Type:application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // On récupère tous les vêtements
    $stmt = $conn->prepare("SELECT * FROM utilisateur WHERE role = 'pending'");
    $stmt->execute();
    $pendingUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // On renvoie le résultat en JSON
    echo json_encode($pendingUsers);
}

$conn = null;
?>