<?php
session_start();
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé. Réservé aux administrateurs.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');
$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nom = trim($_POST['nom'] ?? '');
    $infoLocal = trim($_POST['infoLocal'] ?? '');
    $idSite = $_POST['idSite'] ?? 1;

    if (empty($nom)) {
        echo json_encode(['status' => 'error', 'message' => 'Le nom du local est obligatoire.']);
        exit;
    }

    $chemin_db = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $nomFichier = uniqid('local_') . '.' . $extension;
        $chemin_db = 'assets/img/local/' . $nomFichier;
        $chemin_physique = '../../' . $chemin_db;

        if (!move_uploaded_file($_FILES['photo']['tmp_name'], $chemin_physique)) {
            echo json_encode(['status' => 'error', 'message' => 'Impossible de sauvegarder l\'image.']);
            exit;
        }
    }

    try {
        $stmt = $conn->prepare("INSERT INTO local (nom, infoLocal, idSite, photo) VALUES (:nom, :infoLocal, :idSite, :photo)");
        $stmt->execute([':nom' => $nom, ':infoLocal' => $infoLocal, ':idSite' => $idSite, ':photo' => $chemin_db]);
        
        echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la création du local.']);
    }
}
$conn = null;
?>