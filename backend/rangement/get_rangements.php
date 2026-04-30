<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        if (isset($_GET['idLocal']) && !empty($_GET['idLocal'])) {
            $idLocal = $_GET['idLocal'];
            $stmt = $conn->prepare("SELECT * FROM rangement WHERE idLocal = ?");
            $stmt->execute([$idLocal]);
        } 
        else {
            $stmt = $conn->query("SELECT * FROM rangement ORDER BY idLocal ASC, nom ASC");
        }
        
        $rangements = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rangements);
        
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des rangements.']);
    }
} else {
    echo json_encode([]);
}

$conn = null;
?>