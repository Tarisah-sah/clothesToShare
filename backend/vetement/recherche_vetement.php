<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

$userId = $_GET['userId'] ?? null;
$mode = $_GET['mode'] ?? 'accueil';

// Requête principale
$sql = "SELECT v.*, p.idemprunteur, p.datefinprevue, p.datedebut, u.login as nom_emprunteur, n.idRangement, r.idLocal 
        FROM vetement v 
        LEFT JOIN pret p ON v.idvetement = p.idvetement AND p.statutpret IN ('En prêt', 'Retour en attente', 'En attente')
        LEFT JOIN niveau n ON v.idniveau = n.idNiveau
        LEFT JOIN rangement r ON n.idRangement = r.idRangement
        LEFT JOIN utilisateur u ON p.idemprunteur = u.idutilisateur
        WHERE 1=1";

$params = [];

// Appliction de tous les filtres
if (!empty($_GET['motcle'])) {
    $sql .= " AND (v.nom LIKE :txt1 OR v.marque LIKE :txt2 OR v.description LIKE :txt3)";
    $motcle = "%" . $_GET['motcle'] . "%";
    $params[':txt1'] = $motcle;
    $params[':txt2'] = $motcle;
    $params[':txt3'] = $motcle;
}
if (!empty($_GET['categorie'])) {
    $sql .= " AND v.idcategorie = :cat";
    $params[':cat'] = $_GET['categorie'];
}
if (!empty($_GET['etat'])) {
    $sql .= " AND v.etat = :etat";
    $params[':etat'] = $_GET['etat'];
}
if (!empty($_GET['taille'])) {
    $sql .= " AND v.taille LIKE :taille";
    $params[':taille'] = "%" . $_GET['taille'] . "%";
}
if (!empty($_GET['genre'])) {
    $sql .= " AND v.genre = :genre";
    $params[':genre'] = $_GET['genre'];
}
if (!empty($_GET['type'])) {
    $sql .= " AND v.type LIKE :type";
    $params[':type'] = "%" . $_GET['type'] . "%";
}
if (!empty($_GET['marque'])) {
    $sql .= " AND v.marque LIKE :marque";
    $params[':marque'] = "%" . $_GET['marque'] . "%";
}

// Gestion des couleurs (Sélection multiple)
if (!empty($_GET['couleurs'])) {
    $listeCouleurs = explode(',', $_GET['couleurs']);
    $couleurConditions = [];
    foreach ($listeCouleurs as $index => $couleur) {
        $paramName = ":coul" . $index;
        $couleurConditions[] = "v.couleur LIKE " . $paramName;
        $params[$paramName] = "%" . trim($couleur) . "%";
    }
    $sql .= " AND (" . implode(" OR ", $couleurConditions) . ")";
}

// Utilisation de variables uniques (:uid1 et :uid2)
if ($mode === 'accueil' && $userId) {
    $sql .= " AND v.idproprietaire != :uid1 AND (p.idemprunteur IS NULL OR p.idemprunteur != :uid2)";
    $params[':uid1'] = $userId;
    $params[':uid2'] = $userId;
} else if ($mode === 'dressing' && $userId) {
    $sql .= " AND (v.idproprietaire = :uid1 OR p.idemprunteur = :uid2)";
    $params[':uid1'] = $userId;
    $params[':uid2'] = $userId;
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la recherche.']);
}
?>