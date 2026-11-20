<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

// Sécurité
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

try {
    $conn = pdo_connectDB();
    // On trie par rôle pour que les admins et owners soient en haut de liste
    $stmt = $conn->query("SELECT idutilisateur, nom, prenom, login, role FROM utilisateur ORDER BY role ASC, nom ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des utilisateurs.']);
}
$conn = null;
?>