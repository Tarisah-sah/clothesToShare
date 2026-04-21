<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

if (!isset($_SESSION['idutilisateur'])) {
    echo json_encode(['status' => 'error', 'message' => 'Non autorisé']);
    exit;
}

$conn = pdo_connectDB();
$prenom = $_POST['prenom'];
$nom = $_POST['nom'];
$login = $_POST['login'];
$mdp = $_POST['mdp'] ?? null;

try {
    if ($mdp) {
        // Hachage conseillé mais optionnel selon tes consignes actuelles
        $sql = "UPDATE utilisateur SET nom = ?, prenom = ?, login = ?, mdp = ? WHERE idUtilisateur = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$nom, $prenom, $login, $mdp, $_SESSION['idutilisateur']]);
    } else {
        $sql = "UPDATE utilisateur SET nom = ?, prenom = ?, login = ? WHERE idUtilisateur = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$nom, $prenom, $login, $_SESSION['idutilisateur']]);
    }
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}