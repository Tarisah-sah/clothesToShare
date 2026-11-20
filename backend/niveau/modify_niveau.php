<?php
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');
$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $idNiveau = $_POST['idNiveau'] ?? null;
    $nom = trim($_POST['nom'] ?? '');
    $infoNiveau = trim($_POST['infoNiveau'] ?? '');
    $idRangement = $_POST['idRangement'] ?? null;

    if (!$idNiveau || empty($nom) || !$idRangement) {
        echo json_encode(['status' => 'error', 'message' => 'Données incomplètes.']);
        exit;
    }

    $sql = "UPDATE niveau SET nom = :nom, infoNiveau = :infoNiveau, idRangement = :idRangement";
    $params = [
        ':nom' => $nom, 
        ':infoNiveau' => $infoNiveau, 
        ':idRangement' => $idRangement
    ];

    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        
        $stmtOld = $conn->prepare("SELECT photo FROM niveau WHERE idNiveau = :id");
        $stmtOld->execute([':id' => $idNiveau]);
        $oldData = $stmtOld->fetch();

        $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $nomFichier = uniqid('niveau_') . '.' . $extension;
        $chemin_db = 'assets/img/niveau/' . $nomFichier;
        $chemin_physique = '../../' . $chemin_db;

        if (move_uploaded_file($_FILES['photo']['tmp_name'], $chemin_physique)) {
            $sql .= ", photo = :photo";
            $params[':photo'] = $chemin_db;

            if ($oldData && !empty($oldData['photo']) && file_exists('../../' . $oldData['photo'])) {
                unlink('../../' . $oldData['photo']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Impossible de sauvegarder l\'image.']);
            exit;
        }
    }

    $sql .= " WHERE idNiveau = :id";
    $params[':id'] = $idNiveau;

    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la modification du niveau.']);
    }
}
$conn = null;
?>