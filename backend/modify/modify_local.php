<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn->beginTransaction();
    try {
        // 1. Récupérer l'ancienne photo par défaut
        $stmtPhoto = $conn->prepare("SELECT photo FROM local WHERE idLocal = ?");
        $stmtPhoto->execute([$_POST['idLocal']]);
        $local_photo = $stmtPhoto->fetchColumn();

        // 2. Si une nouvelle photo est uploadée, on l'utilise
        if (isset($_FILES['photo'])) {
            if ($_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                $nomFichier = preg_replace('/[^a-zA-Z0-9.\-_]/', '', basename($_FILES['photo']['name']));
                $local_photo = 'assets/img/wardrobe/' . $nomFichier;
                move_uploaded_file($_FILES['photo']['tmp_name'], '../../' . $local_photo);
            } else {
                throw new Exception("Aucune image reçue ou l'image est trop lourde.");
            }
        }

        // 3. Mise à jour de la base
        $localModifSQL = "UPDATE local SET 
            nom = :nom, infoLocal = :infoLocal, idSite = :idSite, photo = :photo 
            WHERE idLocal = :idLocal";
            
        $stmt = $conn->prepare($localModifSQL);
        $stmt->execute([
            ':nom' => $_POST['nom'],
            ':infoLocal' => trim($_POST['infoLocal']),
            ':idSite' => $_POST['idSite'],
            ':photo' => $local_photo,
            ':idLocal' => $_POST['idLocal']
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