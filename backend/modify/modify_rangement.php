<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn->beginTransaction();
    try {
        // 1. Récupérer l'ancienne photo par défaut
        $stmtPhoto = $conn->prepare("SELECT photo FROM rangement WHERE idRangement = ?");
        $stmtPhoto->execute([$_POST['idRangement']]);
        $rangement_photo = $stmtPhoto->fetchColumn();

        // 2. Si une nouvelle photo est uploadée, on l'utilise
        if (isset($_FILES['photo'])) {
            if ($_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                $nomFichier = preg_replace('/[^a-zA-Z0-9.\-_]/', '', basename($_FILES['photo']['name']));
                $rangement_photo = 'assets/img/wardrobe/' . $nomFichier;
                move_uploaded_file($_FILES['photo']['tmp_name'], '../../' . $rangement_photo);
            } else {
                throw new Exception("Aucune image reçue ou l'image est trop lourde.");
            }
        }

        // 3. Mise à jour de la base
        $rangementModifSQL = "UPDATE rangement SET 
            nom = :nom, infoRangement = :infoRangement, idLocal = :idLocal, photo = :photo 
            WHERE idRangement = :idRangement";
            
        $stmt = $conn->prepare($rangementModifSQL);
        $stmt->execute([
            ':nom' => $_POST['nom'],
            ':infoRangement' => trim($_POST['infoRangement']),
            ':idLocal' => $_POST['idLocal'],
            ':photo' => $rangement_photo,
            ':idRangement' => $_POST['idRangement']
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