<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include('db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $login = trim($data['login'] ?? '');
    $mdp   = $data['mdp'] ?? '';

    // 1. On cherche l'utilisateur UNIQUEMENT par son login
    $stmt = $conn->prepare("SELECT * FROM utilisateur WHERE login = :login");
    $stmt->execute([':login' => $login]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. On vérifie si l'utilisateur existe ET si le mot de passe correspond au hash
    if ($user && password_verify($mdp, $user['mdp'])) {
        
        if ($user['role'] === 'pending') {
            echo json_encode(['status' => 'error', 'message' => 'Compte en attente de validation.']);
        } else {
            // Connexion réussie ! On crée la session
            $_SESSION['idutilisateur'] = $user['idutilisateur'];
            $_SESSION['role'] = $user['role'];
            
            // Sécurité : On enlève le mot de passe des données avant de les renvoyer au JavaScript
            unset($user['mdp']); 
            echo json_encode(['status' => 'success', 'user' => $user]);
        }
    } else {
        // Message générique exprès (pour ne pas indiquer aux pirates si c'est le login OU le mot de passe qui est faux)
        echo json_encode(['status' => 'error', 'message' => 'Identifiants incorrects.']);
    }
}
$conn = null;
?>