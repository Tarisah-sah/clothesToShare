<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['idLocal'])) {
    $idLocal = $_GET['idLocal'];
    
    // On récupère les rangements liés à l'idLocal reçu
    $stmt = $conn->prepare("SELECT * FROM rangement WHERE idLocal = ?");
    $stmt->execute([$idLocal]);
    $rangements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($rangements);
} else {
    echo json_encode([]);
}

$conn = null;
?>