<?php
include('../connexion/db_connect.php');
$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM vetement WHERE 1=1";
    $params = [];

    // Recherche par mot-clé sur TOUS les attributs textuels
    if (!empty($_GET['motcle'])) {
        $sql .= " AND (nom LIKE :m OR marque LIKE :m OR description LIKE :m OR couleur LIKE :m OR type LIKE :m OR taille LIKE :m)";
        $params[':m'] = "%" . $_GET['motcle'] . "%";
    }

    // Filtres exacts
    if (!empty($_GET['categorie'])) { $sql .= " AND idcategorie = :cat"; $params[':cat'] = $_GET['categorie']; }
    if (!empty($_GET['etat'])) { $sql .= " AND etat = :etat"; $params[':etat'] = $_GET['etat']; }
    if (!empty($_GET['taille'])) { $sql .= " AND taille = :taille"; $params[':taille'] = $_GET['taille']; }
    if (!empty($_GET['genre'])) { $sql .= " AND genre = :genre"; $params[':genre'] = $_GET['genre']; }
    if (!empty($_GET['type'])) { $sql .= " AND type LIKE :type"; $params[':type'] = "%" . $_GET['type'] . "%"; }
    if (!empty($_GET['marque'])) { $sql .= " AND marque LIKE :marque"; $params[':marque'] = "%" . $_GET['marque'] . "%"; }

    // Filtre multi-couleurs (IN)
    if (!empty($_GET['couleurs'])) {
        $couleursArray = explode(',', $_GET['couleurs']);
        $placeholders = [];
        foreach($couleursArray as $index => $c) {
            $nomParam = ":c" . $index;
            $placeholders[] = $nomParam;
            $params[$nomParam] = $c;
        }
        $sql .= " AND couleur IN (" . implode(',', $placeholders) . ")";
    }

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $vetements = $stmt->fetchAll(PDO::FETCH_ASSOC);
	
    echo json_encode($vetements);
}
$conn = null;
?>