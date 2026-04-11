<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn->beginTransaction();
    try {
        // 1. Récupérer l'ancienne photo par défaut
        $stmtPhoto = $conn->prepare("SELECT photo FROM vetement WHERE idvetement = ?");
        $stmtPhoto->execute([$_POST['idvetement']]);
        $vetement_photo = $stmtPhoto->fetchColumn();

        // 2. Si une nouvelle photo est uploadée, on l'utilise
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === 0) {
            $nomFichier = preg_replace('/[^a-zA-Z0-9.\-_]/', '', basename($_FILES['photo']['name']));
            $vetement_photo = 'assets/img/wardrobe/' . $nomFichier;
            move_uploaded_file($_FILES['photo']['tmp_name'], '../../' . $vetement_photo);
        }

        // 3. Mise à jour de la base
        $vetementModifSQL = "UPDATE vetement SET 
            nom = :nom, taille = :taille, type = :type, description = :description, couleur = :couleur, 
            etat = :etat, genre = :genre, marque = :marque, photo = :photo, idcategorie = :idcategorie, 
            idniveau = :idniveau, idproprietaire = :idproprietaire 
            WHERE idvetement = :idvetement";
            
        $stmt = $conn->prepare($vetementModifSQL);
        $stmt->execute([
            ':nom' => $_POST['nom'],
            ':taille' => $_POST['taille'],
            ':type' => $_POST['type'],
            ':description' => trim($_POST['description']),
            ':couleur' => $_POST['couleur'],
            ':etat' => $_POST['etat'],
            ':genre' => $_POST['genre'],
            ':marque' => $_POST['marque'],
            ':photo' => $vetement_photo,
            ':idcategorie' => $_POST['idcategorie'],
            ':idniveau' => $_POST['idniveau'], // Pourrait être dynamique plus tard
            ':idproprietaire' => $_POST['idproprietaire'],
            ':idvetement' => $_POST['idvetement']
        ]);
        
        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn=null;
?>