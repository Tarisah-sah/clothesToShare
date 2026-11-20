<?php
session_start();
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');
$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idRangement = $_POST['idRangement'] ?? null;
    $nom = trim($_POST['nom'] ?? '');
    $infoRangement = trim($_POST['infoRangement'] ?? '');
    $idLocal = $_POST['idLocal'] ?? null;

    if (!$idRangement || empty($nom) || !$idLocal) {
        echo json_encode(['status' => 'error', 'message' => 'Données incomplètes.']);
        exit;
    }

    $sql = "UPDATE rangement SET nom = :nom, infoRangement = :infoRangement, idLocal = :idLocal";
    $params = [
        ':nom' => $nom, 
        ':infoRangement' => $infoRangement, 
        ':idLocal' => $idLocal, 
        ':idRangement' => $idRangement
    ];

    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $stmtOld = $conn->prepare("SELECT photo FROM rangement WHERE idRangement = :id");
        $stmtOld->execute([':id' => $idRangement]);
        $oldData = $stmtOld->fetch();

        $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $nomFichier = uniqid('rangement_') . '.' . $extension;
        $chemin_db = 'assets/img/rangement/' . $nomFichier;
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

    $sql .= " WHERE idRangement = :idRangement";

    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la modification du rangement.']);
    }
}
$conn = null;
?>