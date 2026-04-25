<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

$mode = $_GET['mode'] ?? 'accueil';
$userId = $_GET['userId'] ?? null;
$idNiveau = $_GET['idNiveau'] ?? null; 

$sqlBase = "SELECT v.*, p.idemprunteur, n.idRangement, r.idLocal 
            FROM vetement v 
            LEFT JOIN pret p ON v.idvetement = p.idvetement AND p.statutpret IN ('En prêt', 'Retour en attente')
            LEFT JOIN niveau n ON v.idniveau = n.idNiveau
            LEFT JOIN rangement r ON n.idRangement = r.idRangement";

try {
    if ($idNiveau) {
        $sql = $sqlBase . " WHERE v.idniveau = :idNiveau";
        $params = [':idNiveau' => $idNiveau];
        
        // MODIFICATION : On exclut les vêtements de l'utilisateur de l'Explorer
        if ($userId) {
            $sql .= " AND v.idproprietaire != :uid1 AND (p.idemprunteur IS NULL OR p.idemprunteur != :uid2)";
            $params[':uid1'] = $userId;
            $params[':uid2'] = $userId;
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

    } else if ($mode === 'dressing' && $userId) {
        $favoris = isset($_GET['favoris']) ? explode(',', $_GET['favoris']) : [];
        $sql = $sqlBase . " WHERE v.idproprietaire = :uid1 OR p.idemprunteur = :uid2";
        
        if (!empty($favoris)) {
            $inQuery = implode(',', array_map('intval', $favoris));
            $sql .= " OR v.idvetement IN ($inQuery)";
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([':uid1' => $userId, ':uid2' => $userId]);

    } else if ($mode === 'accueil' && $userId) {
        $sql = $sqlBase . " WHERE v.idproprietaire != :uid1 AND (p.idemprunteur IS NULL OR p.idemprunteur != :uid2)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':uid1' => $userId, ':uid2' => $userId]);

    } else {
        $stmt = $conn->query($sqlBase);
    }
    
    $vetements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($vetements);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
$conn = null;
?>