<?php
session_start();

if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] === 'user') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé. Ton rôle ne te permet pas de modifier la garde-robe.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn->beginTransaction();
    try {
        // Récupérer l'ancienne photo
        $stmtPhoto = $conn->prepare("SELECT photo FROM vetement WHERE idvetement = ?");
        $stmtPhoto->execute([$_POST['idvetement']]);
        $vetement_photo = $stmtPhoto->fetchColumn();

        // Si une nvelle photo est chargée
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
            $nomFichier = uniqid('v_') . '.' . $extension;
            $cheminFichierDB = 'assets/img/wardrobe/' . $nomFichier;
            $cheminFichierPhysique = '../../' . $cheminFichierDB;

            if (move_uploaded_file($_FILES['photo']['tmp_name'], $cheminFichierPhysique)) {
                // Si l'ajout réussit, on met à jour la variable avec le nouveau chemin
                $vetement_photo = $cheminFichierDB;
            } else {
                 throw new Exception("Erreur lors de la sauvegarde de la nouvelle image.");
            }
        }

        // Mise à jour de la bd
        $vetementModifSQL = "UPDATE vetement SET 
            nom = :nom, taille = :taille, type = :type, description = :description, couleur = :couleur, 
            etat = :etat, genre = :genre, marque = :marque, photo = :photo, idcategorie = :idcategorie, 
            idniveau = :idniveau
            WHERE idvetement = :idvetement AND idproprietaire = :idproprietaire_session";
            
        $stmt = $conn->prepare($vetementModifSQL);
        $result = $stmt->execute([
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
            ':idniveau' => $_POST['idniveau'],
            ':idvetement' => $_POST['idvetement'],
            ':idproprietaire_session' => $_SESSION['idutilisateur'] 
        ]);

        if ($stmt->rowCount() === 0) {
             throw new Exception("Aucune modification effectuée. Ce vêtement ne t'appartient pas ou n'existe pas.");
        }
        
        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        $messageErreur = 'Erreur lors de la modification.';
        echo json_encode(['status' => 'error', 'message' => $messageErreur]);
    }
}
$conn = null;
?>