<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Pour l'explorer, on récupère les locaux du site selectionné
        if (isset($_GET['idSite']) && !empty($_GET['idSite'])) {
            $stmt = $conn->prepare("SELECT * FROM local WHERE idSite = ? ORDER BY (nom = 'Autre' OR idLocal = 1) ASC, nom ASC");
            $stmt->execute([$_GET['idSite']]);
        } 
        // Pour la page admin, on renvoie tous les locaux
        else {
            $stmt = $conn->query("SELECT * FROM local ORDER BY idSite ASC, (nom = 'Autre' OR idLocal = 1) ASC");
        }
        
        $locaux = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($locaux);
        
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des locaux.']);
    }
}

$conn = null;
?>