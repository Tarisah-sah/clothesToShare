<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['idRangement'])) {
    $idRangement = $_GET['idRangement'];
    
    // On récupère les niveaux liés à l'idRangement reçu
    $stmt = $conn->prepare("SELECT * FROM niveau WHERE idRangement = ?");
    $stmt->execute([$idRangement]);
    $niveaux = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($niveaux);
} else {
    echo json_encode([]);
}

$conn = null;
?>