<?php
header('Content-Type: text/html; charset=utf-8');
include('db_connect.php');

$conn=pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $utilisateur_new = $_POST['utilisateur_new'];
	
    $utilisateurAjoutSQL = "INSERT INTO 
        utilisateur (email, nom, prenom, adresse, pseudo, mdp, role) VALUES 
        (:email, :nom, :prenom, :adresse, :pseudo, :mdp, :role)
    ";
    $stmt = $conn->prepare($utilisateurAjoutSQL);
    $stmt->execute([
        ':email' => $utilisateur_new['email'],
        ':nom' => $utilisateur_new['nom'],
        ':prenom' => $utilisateur_new['prenom'],
        ':adresse' => $utilisateur_new['adresse'],
        ':pseudo' => $utilisateur_new['pseudo'],
        ':mdp' => password_hash($utilisateur_new['mdp'], PASSWORD_DEFAULT),
        ':role' => 'pending'
    ]);

    $id_newUtilisateur = $conn->lastInsertId();
    echo json_encode($id_newUtilisateur);
}
?>