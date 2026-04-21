<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Cas 1 : On a reçu un idLocal (ex: depuis l'arborescence)
        if (isset($_GET['idLocal']) && !empty($_GET['idLocal'])) {
            $idLocal = $_GET['idLocal'];
            $stmt = $conn->prepare("SELECT * FROM rangement WHERE idLocal = ?");
            $stmt->execute([$idLocal]);
        } 
        // Cas 2 : Aucun idLocal n'est fourni (ex: depuis le panel Admin)
        else {
            // On récupère tout, et on trie par Local puis par Nom
            $stmt = $conn->query("SELECT * FROM rangement ORDER BY idLocal ASC, nom ASC");
        }
        
        $rangements = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rangements);
        
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode([]);
}

$conn = null;
?>