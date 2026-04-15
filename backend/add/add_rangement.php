<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// ajouter un nouveau rangement
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rangement_new = $_POST['rangement_new'];
    
    $conn->beginTransaction();
    try {
        if (isset($_FILES['photo'])) {
            if ($_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                $nomFichier = preg_replace('/[^a-zA-Z0-9.\-_]/', '', basename($_FILES['photo']['name']));
                $rangement_chemin_db = 'assets/img/rangement/' . $nomFichier;
                $rangement_chemin_physique = '../../' . $rangement_chemin_db;
            } else {
                throw new Exception("Aucune image reçue ou l'image est trop lourde.");
            }
        } else {
            $rangement_chemin_db = ''; // Pas d'image fournie
        }

        $sql = "INSERT INTO rangement (nom, infoRangement, idLocal, photo) 
                VALUES (:nom, :infoRangement, :idlocal, :photo)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':nom' => $rangement_new['nom'],
            ':infoRangement' => $rangement_new['infoRangement'],
            ':idlocal' => $rangement_new['idlocal'],
            ':photo' => $rangement_chemin_db
        ]);

        if ($rangement_chemin_physique && !move_uploaded_file($_FILES['photo']['tmp_name'], $rangement_chemin_physique)) {
            throw new Exception("Impossible de sauvegarder l'image.");
        }
        
        $conn->commit();
        echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}