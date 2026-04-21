<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // On récupère tous les locaux
    $stmt = $conn->prepare("SELECT * FROM local");
    $stmt->execute();
    $locaux = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($locaux);
}

$conn = null;
?>