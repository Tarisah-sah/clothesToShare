<?php
session_start();

// Vérifier les droits
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé. Réservé aux admins.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');
$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Nettoyage et verif des données entrantes
    $nom = trim($_POST['nom'] ?? '');
    $infoPlus = trim($_POST['infoPlus'] ?? '');

    if (empty($nom)) {
        echo json_encode(['status' => 'error', 'message' => 'Le nom de la catégorie est obligatoire.']);
        exit;
    }

    try {
        // Insertion sécurisée en bd
        $stmt = $conn->prepare("INSERT INTO categorie (nom, infoPlus) VALUES (:nom, :infoPlus)");
        $stmt->execute([':nom' => $nom, ':infoPlus' => $infoPlus]);
        
        // On renvoie l'ID généré pour pouvoir mettre à jour l'interface immédiatement si besoin
        echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la création de la catégorie.']);
    }
}
$conn = null;
?>