<?php
session_start(); // Active les sessions PHP 
header('Content-Type: application/json; charset=utf-8');
include('db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $login = trim($data['login'] ?? '');
    $mdp   = $data['mdp'] ?? '';

    $stmt = $conn->prepare("SELECT * FROM utilisateur WHERE login = :login AND mdp = :mdp");
    $stmt->execute([':login' => $login, ':mdp' => $mdp]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if ($user['role'] === 'pending') {
            echo json_encode(['status' => 'error', 'message' => 'Compte en attente de validation.']);
        } else {
            // ON ENREGISTRE EN SESSION SERVEUR 
            $_SESSION['idutilisateur'] = $user['idutilisateur'];
            $_SESSION['role'] = $user['role'];
            
            unset($user['mdp']);
            echo json_encode(['status' => 'success', 'user' => $user]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Login ou mot de passe incorrect.']);
    }
}
$conn = null;
?>