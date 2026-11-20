<?php
header('Content-Type:application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // On récupère uniquement les utilisateurs validés (admin, owner ou user)
    $stmt = $conn->prepare("SELECT idutilisateur, nom, prenom, login FROM utilisateur WHERE role IN ('admin', 'user', 'owner')");
    $stmt->execute();
    $utilisateurs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($utilisateurs);
}

$conn = null;
?>