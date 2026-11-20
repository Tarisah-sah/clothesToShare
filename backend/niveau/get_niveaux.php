<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        if (isset($_GET['idRangement']) && !empty($_GET['idRangement'])) {
            $stmt = $conn->prepare("SELECT * FROM niveau WHERE idRangement = ?");
            $stmt->execute([$_GET['idRangement']]);
        } else {
            $stmt = $conn->query("SELECT * FROM niveau ORDER BY idRangement ASC, nom ASC");
        }
        
        $niveaux = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($niveaux);
        
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des niveaux.']);
    }
} else {
    echo json_encode([]);
}

$conn = null;
?>