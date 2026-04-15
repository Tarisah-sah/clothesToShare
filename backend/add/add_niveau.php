<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// ajouter un nouveau niveau
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $niveau_new = $_POST['niveau_new'];
    
    $conn->beginTransaction();
    try {
        if (isset($_FILES['photo'])) {
            if ($_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                $nomFichier = preg_replace('/[^a-zA-Z0-9.\-_]/', '', basename($_FILES['photo']['name']));
                $niveau_chemin_db = 'assets/img/niveau/' . $nomFichier;
                $niveau_chemin_physique = '../../' . $niveau_chemin_db;
            } else {
                throw new Exception("Aucune image reçue ou l'image est trop lourde.");
            }
        } else {
            $niveau_chemin_db = ''; // Pas d'image fournie
        }
        
        $sql = "INSERT INTO niveau (nom, infoNiveau, idRangement, photo) 
                VALUES (:nom, :infoNiveau, :idrangement, :photo)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':nom' => $niveau_new['nom'],
            ':infoNiveau' => $niveau_new['infoNiveau'],
            ':idrangement' => $niveau_new['idrangement'],
            ':photo' => $niveau_chemin_db
        ]);

        if ($niveau_chemin_physique && !move_uploaded_file($_FILES['photo']['tmp_name'], $niveau_chemin_physique)) {
            throw new Exception("Impossible de sauvegarder l'image.");
        }
        
        $conn->commit();
        echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}