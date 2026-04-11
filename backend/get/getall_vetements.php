<?php
header('Content-Type:application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $mode = $_GET['mode'] ?? 'accueil';
    $userId = $_GET['userId'] ?? null;
    
    // 1. Mode Arborescence (Bulles)
    if (isset($_GET['idNiveau'])) {
        $stmt = $conn->prepare("SELECT * FROM vetement WHERE idniveau = ?");
        $stmt->execute([$_GET['idNiveau']]);
    } 
    // 2. Mode "Mon Dressing" (Mes possessions + Mes emprunts en cours)
    else if ($mode === 'dressing' && $userId) {
        $sql = "SELECT DISTINCT v.* FROM vetement v 
                LEFT JOIN pret p ON v.idvetement = p.idvetement AND p.statutpret = 'En prêt'
                WHERE v.idproprietaire = :uid1 OR p.idemprunteur = :uid2";
        $stmt = $conn->prepare($sql);
        // CORRECTION : On envoie la valeur dans deux variables différentes
        $stmt->execute([':uid1' => $userId, ':uid2' => $userId]);
    }
    // 3. Mode "Accueil" connecté (Tout SAUF mes possessions et mes emprunts)
    else if ($mode === 'accueil' && $userId) {
        $sql = "SELECT DISTINCT v.* FROM vetement v 
                LEFT JOIN pret p ON v.idvetement = p.idvetement AND p.statutpret = 'En prêt'
                WHERE v.idproprietaire != :uid1 AND (p.idemprunteur IS NULL OR p.idemprunteur != :uid2)";
        $stmt = $conn->prepare($sql);
        // CORRECTION : On envoie la valeur dans deux variables différentes
        $stmt->execute([':uid1' => $userId, ':uid2' => $userId]);
    }
    // 4. Mode "Accueil" NON connecté (Affiche tout)
    else {
        $stmt = $conn->prepare("SELECT * FROM vetement");
        $stmt->execute();
    }
    
    $vetements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($vetements);
}

$conn = null;
?>