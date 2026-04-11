<?php
header('Content-Type:application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Si on a cliqué sur un niveau dans l'arborescence
    if (isset($_GET['idNiveau'])) {
        $stmt = $conn->prepare("SELECT * FROM vetement WHERE idniveau = ?");
        $stmt->execute([$_GET['idNiveau']]);
    } 
    // Sinon, comportement normal (on affiche tout pour "Mon Dressing")
    else {
        $stmt = $conn->prepare("SELECT * FROM vetement");
        $stmt->execute();
    }
    
    $vetements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($vetements);
}

$conn = null;
?>