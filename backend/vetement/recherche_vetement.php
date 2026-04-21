<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

$userId = $_GET['userId'] ?? null;
$mode = $_GET['mode'] ?? 'accueil';

// Jointure pour récupérer l'emprunteur
$sql = "SELECT v.*, p.idemprunteur 
        FROM vetement v 
        LEFT JOIN pret p ON v.idvetement = p.idvetement AND p.statutpret IN ('En prêt', 'Retour en attente')
        WHERE 1=1";

$params = [];

if (isset($_GET['motcle'])) {
    $sql .= " AND (v.nom LIKE :txt OR v.marque LIKE :txt OR v.description LIKE :txt)";
    $params[':txt'] = "%" . $_GET['motcle'] . "%";
}
if (isset($_GET['categorie'])) {
    $sql .= " AND v.idcategorie = :cat";
    $params[':cat'] = $_GET['categorie'];
}
if (isset($_GET['etat'])) {
    $sql .= " AND v.etat = :etat";
    $params[':etat'] = $_GET['etat'];
}

// Filtre selon le mode (Accueil vs Dressing)
if ($mode === 'accueil' && $userId) {
    $sql .= " AND v.idproprietaire != :uid AND (p.idemprunteur IS NULL OR p.idemprunteur != :uid)";
    $params[':uid'] = $userId;
} else if ($mode === 'dressing' && $userId) {
    $sql .= " AND (v.idproprietaire = :uid OR p.idemprunteur = :uid)";
    $params[':uid'] = $userId;
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>