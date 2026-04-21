<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

$mode = $_GET['mode'] ?? 'accueil';
$userId = $_GET['userId'] ?? null;

// On sélectionne v.* ET p.idemprunteur pour savoir qui emprunte quoi
$sqlBase = "SELECT v.*, p.idemprunteur 
            FROM vetement v 
            LEFT JOIN pret p ON v.idvetement = p.idvetement AND p.statutpret IN ('En prêt', 'Retour en attente')";

try {
    if ($mode === 'dressing' && $userId) {
        $favoris = isset($_GET['favoris']) ? explode(',', $_GET['favoris']) : [];
        $sql = $sqlBase . " WHERE v.idproprietaire = :uid1 OR p.idemprunteur = :uid2";
        
        if (!empty($favoris)) {
            $inQuery = implode(',', array_map('intval', $favoris));
            $sql .= " OR v.idvetement IN ($inQuery)";
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([':uid1' => $userId, ':uid2' => $userId]);

    } else if ($mode === 'accueil' && $userId) {
        // Accueil connecté : on exclut ses propres vêtements et ses propres emprunts
        $sql = $sqlBase . " WHERE v.idproprietaire != :uid1 AND (p.idemprunteur IS NULL OR p.idemprunteur != :uid2)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':uid1' => $userId, ':uid2' => $userId]);

    } else {
        // Accueil déconnecté
        $stmt = $conn->query($sqlBase);
    }
    
    $vetements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($vetements);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
$conn = null;
?>