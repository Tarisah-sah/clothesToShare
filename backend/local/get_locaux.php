<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->prepare("SELECT * FROM local");
        $stmt->execute();
        $locaux = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($locaux);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des locaux.']);
    }
}

$conn = null;
?>