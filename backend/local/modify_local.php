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
    $idLocal = $_POST['idLocal'] ?? null;
    $nom = trim($_POST['nom'] ?? '');
    $idSite = trim($_POST['idSite'] ?? '');
    $infoLocal = trim($_POST['infoLocal'] ?? '');

    if (!$idLocal || empty($nom)) {
        echo json_encode(['status' => 'error', 'message' => 'ID ou nom manquant.']);
        exit;
    }

    $sql = "UPDATE local SET nom = :nom, infoLocal = :infoLocal, idSite = :idSite";
    $params = [
        ':nom' => $nom, 
        ':infoLocal' => $infoLocal, 
        ':idSite' => $idSite, 
        ':id' => $idLocal
    ];

    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        
        $stmtOld = $conn->prepare("SELECT photo FROM local WHERE idLocal = :id");
        $stmtOld->execute([':id' => $idLocal]);
        $oldData = $stmtOld->fetch();

        $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $nomFichier = uniqid('local_') . '.' . $extension;
        $chemin_db = 'assets/img/local/' . $nomFichier;
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

    $sql .= " WHERE idLocal = :id";
    
    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la modification du local.']);
    }
}
$conn = null;
?>