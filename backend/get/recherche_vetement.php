<?php
include('../connexion/db_connect.php');
$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Récupération sécurisée des paramètres
    $vetement_recherche = $_GET['vetement_recherche'] ?? '';
    $vetement_motcle = "%" . $vetement_recherche . "%";
    $vetement_categorie = $_GET['vetement_categorie'] ?? '';
    $vetement_etat = $_GET['vetement_etat'] ?? '';

    // Construction dynamique de la requête
    $sql = "SELECT * FROM vetement WHERE (nom LIKE :motcle1 OR marque LIKE :motcle2)";
    $params = [
        ':motcle1' => $vetement_motcle,
        ':motcle2' => $vetement_motcle
    ];

    // On n'ajoute les filtres que s'ils sont remplis et différents de "toutes"
    if ($vetement_categorie !== '' && $vetement_categorie !== 'toutes') {
        $sql .= " AND idcategorie = :categorie";
        $params[':categorie'] = $vetement_categorie;
    }

    if ($vetement_etat !== '' && $vetement_etat !== 'tous') { 
        $sql .= " AND etat = :etat";
        $params[':etat'] = $vetement_etat;
    }

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $vetements = $stmt->fetchAll(PDO::FETCH_ASSOC);
	
    echo json_encode($vetements);
}
$conn = null;
?>