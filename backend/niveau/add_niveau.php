<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

// Petit contrôle de sécurité (optionnel mais conseillé)
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

$conn = pdo_connectDB();
$nom = $_POST['nom'] ?? '';
$infoNiveau = $_POST['infoNiveau'] ?? '';
$idRangement = $_POST['idRangement'] ?? null;

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
    
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>