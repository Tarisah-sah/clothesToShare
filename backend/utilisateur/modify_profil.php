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
        // On sécurise le nouveau mot de passe
        $mdpHash = password_hash($mdp, PASSWORD_DEFAULT);
        
        $sql = "UPDATE utilisateur SET nom = ?, prenom = ?, login = ?, mdp = ? WHERE idUtilisateur = ?";
        $stmt = $conn->prepare($sql);
        // on renvoie le hash 
        $stmt->execute([$nom, $prenom, $login, $mdpHash, $_SESSION['idutilisateur']]);
    } else {
        $sql = "UPDATE utilisateur SET nom = ?, prenom = ?, login = ? WHERE idUtilisateur = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$nom, $prenom, $login, $_SESSION['idutilisateur']]);
    }
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la mise à jour du profil.']);
}