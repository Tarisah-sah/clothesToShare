<?php
header('Content-Type:application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // On récupère tous les vêtements
    $stmt = $conn->prepare("SELECT * FROM vetement");
    $stmt->execute();
    $vetements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // On renvoie le résultat en JSON
    echo json_encode($vetements);
}

$conn = null;
?>