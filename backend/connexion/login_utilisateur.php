<?php
header('Content-Type: application/json; charset=utf-8');
include('db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $login = trim($data['login'] ?? '');
    $mdp   = $data['mdp'] ?? '';

    if (!$login || !$mdp) {
        echo json_encode(['status' => 'error', 'message' => 'Merci de remplir tous les champs.']);
        exit;
    }

    // On cherche l'utilisateur dans la base de données
    $stmt = $conn->prepare("SELECT * FROM utilisateur WHERE login = :login AND mdp = :mdp");
    $stmt->execute([':login' => $login, ':mdp' => $mdp]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // On empêche les utilisateurs non validés de se connecter
        if ($user['role'] === 'pending') {
            echo json_encode(['status' => 'error', 'message' => 'Votre compte est en attente de validation par un administrateur.']);
        } else {
            // Sécurité : On ne renvoie pas le mot de passe au client JS
            unset($user['mdp']);
            echo json_encode(['status' => 'success', 'user' => $user]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Login ou mot de passe incorrect.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée.']);
}

$conn = null;
?>