<?php
header('Content-Type:application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $mode = $_GET['mode'] ?? 'accueil';
    $userId = $_GET['userId'] ?? null;
    $params = [];

    $sql = "SELECT DISTINCT v.* FROM vetement v ";
    
    // Jointure nécessaire pour vérifier les emprunts si on est connecté
    if ($userId) {
        $sql .= " LEFT JOIN pret p ON v.idvetement = p.idvetement AND p.statutpret IN ('En prêt', 'Retour en attente') ";
    }
    
    $sql .= " WHERE 1=1 ";

    // Filtre du mode (Accueil vs Dressing)
    if ($mode === 'dressing' && $userId) {
        $sql .= " AND (v.idproprietaire = :uid1 OR p.idemprunteur = :uid2) ";
        $params[':uid1'] = $userId;
        $params[':uid2'] = $userId;
    } else if ($mode === 'accueil' && $userId) {
        $sql .= " AND v.idproprietaire != :uid1 AND (p.idemprunteur IS NULL OR p.idemprunteur != :uid2) ";
        $params[':uid1'] = $userId;
        $params[':uid2'] = $userId;
    }

    // Recherche par mot-clé (Correction des variables nommées uniques)
    if (!empty($_GET['motcle'])) {
        $sql .= " AND (v.nom LIKE :m1 OR v.marque LIKE :m2 OR v.description LIKE :m3 OR v.couleur LIKE :m4 OR v.type LIKE :m5 OR v.taille LIKE :m6)";
        $m = "%" . $_GET['motcle'] . "%";
        $params[':m1'] = $m;
        $params[':m2'] = $m;
        $params[':m3'] = $m;
        $params[':m4'] = $m;
        $params[':m5'] = $m;
        $params[':m6'] = $m;
    }

    // Filtres exacts (avec préfixe v. pour désigner la table vetement)
    if (!empty($_GET['categorie'])) { $sql .= " AND v.idcategorie = :cat"; $params[':cat'] = $_GET['categorie']; }
    if (!empty($_GET['etat'])) { $sql .= " AND v.etat = :etat"; $params[':etat'] = $_GET['etat']; }
    if (!empty($_GET['taille'])) { $sql .= " AND v.taille = :taille"; $params[':taille'] = $_GET['taille']; }
    if (!empty($_GET['genre'])) { $sql .= " AND v.genre = :genre"; $params[':genre'] = $_GET['genre']; }
    if (!empty($_GET['type'])) { $sql .= " AND v.type LIKE :type"; $params[':type'] = "%" . $_GET['type'] . "%"; }
    if (!empty($_GET['marque'])) { $sql .= " AND v.marque LIKE :marque"; $params[':marque'] = "%" . $_GET['marque'] . "%"; }

    // Filtre multi-couleurs (IN)
    if (!empty($_GET['couleurs'])) {
        $couleursArray = explode(',', $_GET['couleurs']);
        $placeholders = [];
        foreach($couleursArray as $index => $c) {
            $nomParam = ":c" . $index;
            $placeholders[] = $nomParam;
            $params[$nomParam] = $c;
        }
        $sql .= " AND v.couleur IN (" . implode(',', $placeholders) . ")";
    }

    // Exécution
    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $vetements = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($vetements);
    } catch (Exception $e) {
        // Renvoie une vraie erreur JSON si le SQL plante (pratique pour débugger)
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>