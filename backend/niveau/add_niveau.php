<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

// Petit contrôle de sécurité
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

$conn = pdo_connectDB();
$nom = trim($_POST['nom'] ?? '');
$infoNiveau = trim($_POST['infoNiveau'] ?? '');
$idRangement = $_POST['idRangement'] ?? null;

if (empty($nom) || !$idRangement) {
    echo json_encode(['status' => 'error', 'message' => 'Le nom et le rangement sont obligatoires.']);
    exit;
}

$chemin_db = null;
if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
    $nomFichier = uniqid('niveau_') . '.' . $extension;
    $chemin_db = 'assets/img/niveau/' . $nomFichier;
    $chemin_physique = '../../' . $chemin_db;

    if (!move_uploaded_file($_FILES['photo']['tmp_name'], $chemin_physique)) {
        echo json_encode(['status' => 'error', 'message' => 'Impossible de sauvegarder l\'image.']);
        exit;
    }
}

try {
    $sql = "INSERT INTO niveau (nom, infoNiveau, idRangement, photo) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$nom, $infoNiveau, $idRangement, $chemin_db]);
    
    echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la création du niveau.']);
}
$conn = null;
?>