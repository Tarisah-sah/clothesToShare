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
    $nom = trim($_POST['nom'] ?? '');
    $infoRangement = trim($_POST['infoRangement'] ?? '');
    $idLocal = $_POST['idLocal'] ?? null;

    if (empty($nom) || !$idLocal) {
        echo json_encode(['status' => 'error', 'message' => 'Le nom et le local sont obligatoires.']);
        exit;
    }

    $chemin_db = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $nomFichier = uniqid('rangement_') . '.' . $extension;
        $chemin_db = 'assets/img/rangement/' . $nomFichier;
        $chemin_physique = '../../' . $chemin_db;

        if (!move_uploaded_file($_FILES['photo']['tmp_name'], $chemin_physique)) {
            echo json_encode(['status' => 'error', 'message' => 'Impossible de sauvegarder l\'image.']);
            exit;
        }
    }

    try {
        $stmt = $conn->prepare("INSERT INTO rangement (nom, infoRangement, idLocal, photo) VALUES (:nom, :infoRangement, :idLocal, :photo)");
        $stmt->execute([':nom' => $nom, ':infoRangement' => $infoRangement, ':idLocal' => $idLocal, ':photo' => $chemin_db]);
        
        echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>