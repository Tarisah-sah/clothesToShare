<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// ajouter un nouveau local
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $local_new = $_POST['local_new'];
    
    $conn->beginTransaction();
    try {
        if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Aucune image reçue ou l'image est trop lourde.");
        }

        $nomFichier = preg_replace('/[^a-zA-Z0-9.\-_]/', '', basename($_FILES['photo']['name']));
        $local_chemin_db = 'assets/img/local/' . $nomFichier;
        $local_chemin_physique = '../../' . $local_chemin_db;

        $sql = "INSERT INTO local (nom, infoLocal, idSite, photo) 
                VALUES (:nom, :infoLocal, :idsite, :photo)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':nom' => $local_new['nom'],
            ':infoLocal' => $local_new['infoLocal'],
            ':idsite' => $local_new['idsite'],
            ':photo' => $local_chemin_db
        ]);

        if (!move_uploaded_file($_FILES['photo']['tmp_name'], $local_chemin_physique)) {
            throw new Exception("Impossible de sauvegarder l'image.");
        }
        
        $conn->commit();
        echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}