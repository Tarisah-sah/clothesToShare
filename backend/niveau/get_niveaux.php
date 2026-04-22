<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Si on cherche les niveaux d'un rangement spécifique (pour la cascade)
        if (isset($_GET['idRangement']) && !empty($_GET['idRangement'])) {
            $stmt = $conn->prepare("SELECT * FROM niveau WHERE idRangement = ?");
            $stmt->execute([$_GET['idRangement']]);
        } 
        // Sinon, on renvoie TOUS les niveaux (pour le panel Admin)
        else {
            $stmt = $conn->query("SELECT * FROM niveau ORDER BY idRangement ASC, nom ASC");
        }
        
        $niveaux = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($niveaux);
        
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode([]);
}

$conn = null;
?>