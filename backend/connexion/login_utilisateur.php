<?php
session_start();

header('Content-Type: application/json; charset=utf-8');
include('db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $login = trim($data['login'] ?? '');
    $mdp   = $data['mdp'] ?? '';

    // On cherche l'utilisateur UNIQUEMENT par son login
    $stmt = $conn->prepare("SELECT * FROM utilisateur WHERE login = :login");
    $stmt->execute([':login' => $login]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // On vérifie si l'utilisateur existe ET si le mot de passe correspond au hash
    if ($user && password_verify($mdp, $user['mdp'])) {
        
        if ($user['role'] === 'pending') {
            echo json_encode(['status' => 'error', 'message' => 'Compte en attente de validation.']);
        } else {
            // On crée la session
            $_SESSION['idutilisateur'] = $user['idutilisateur'];
            $_SESSION['role'] = $user['role'];
            
            // On enlève le mot de passe des données avant de les renvoyer au js
            unset($user['mdp']); 
            echo json_encode(['status' => 'success', 'user' => $user]);
        }
    } else {
        // Message générique
        echo json_encode(['status' => 'error', 'message' => 'Identifiants incorrects.']);
    }
}
$conn = null;
?>