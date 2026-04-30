<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->query("SELECT * FROM site ORDER BY nom ASC");
        $sites = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($sites);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des sites.']);
    }
}
$conn = null;
?>