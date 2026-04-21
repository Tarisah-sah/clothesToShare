<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

// Sécurité : on vérifie que l'utilisateur est bien connecté
if (!isset($_SESSION['idutilisateur'])) {
    echo json_encode(['status' => 'error', 'message' => 'Non connecté']);
    exit;
}

$conn = pdo_connectDB();
// On sélectionne uniquement les colonnes nécessaires (nom, prénom, login)
$stmt = $conn->prepare("SELECT nom, prenom, login FROM utilisateur WHERE idUtilisateur = ?");
$stmt->execute([$_SESSION['idutilisateur']]);

// On renvoie les données au format JSON
echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));