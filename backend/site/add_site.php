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
    $adresse = trim($_POST['adresse'] ?? '');
    $code_postal = trim($_POST['code_postal'] ?? '');
    $localite = trim($_POST['localite'] ?? '');

    if (empty($nom)) {
        echo json_encode(['status' => 'error', 'message' => 'Le nom du site est obligatoire.']);
        exit;
    }

    $chemin_db = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $nomFichier = uniqid('site_') . '.' . $extension;
        $chemin_db = 'assets/img/site/' . $nomFichier;
        $chemin_physique = '../../' . $chemin_db;

        if (!move_uploaded_file($_FILES['photo']['tmp_name'], $chemin_physique)) {
            echo json_encode(['status' => 'error', 'message' => 'Impossible de sauvegarder l\'image.']);
            exit;
        }
    }

    try {
        $stmt = $conn->prepare("INSERT INTO site (nom, adresse, code_postal, localite, photo) VALUES (:nom, :adresse, :cp, :localite, :photo)");
        $stmt->execute([
            ':nom' => $nom, 
            ':adresse' => $adresse, 
            ':cp' => $code_postal, 
            ':localite' => $localite,
            ':photo' => $chemin_db
        ]);
        
        echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la création du site.']);
    }
}
$conn = null;
?>