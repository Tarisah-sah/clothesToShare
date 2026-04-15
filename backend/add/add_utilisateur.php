<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $email   = trim($data['email']   ?? '');
    $nom     = trim($data['nom']     ?? '');
    $prenom  = trim($data['prenom']  ?? '');
    $adresse = trim($data['adresse'] ?? '');
    $login   = trim($data['login']   ?? '');
    $sexe    = trim($data['sexe']    ?? '');
    $mdp     = $data['mdp']          ?? '';

    if (!$email || !$nom || !$prenom || !$adresse || !$login || !$mdp || !$sexe) {
        echo json_encode(['status' => 'error', 'message' => 'Tous les champs sont obligatoires.']);
        exit;
    }

    // Vérifier si le login ou l'email est déjà pris
    $checkSQL = "SELECT COUNT(*) FROM utilisateur WHERE email LIKE :email OR login LIKE :login";
    $stmt = $conn->prepare($checkSQL);
    $stmt->execute([':email' => $email, ':login' => $login]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Cet email ou ce login est déjà utilisé.']);
        exit;
    }

    // Insérer avec role = 'pending'
    $sql = "INSERT INTO utilisateur (email, sexe, nom, prenom, adresse, login, mdp)
            VALUES (:email, :sexe, :nom, :prenom, :adresse, :login, :mdp)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':email'   => $email,
        ':sexe'    => $sexe,
        ':nom'     => $nom,
        ':prenom'  => $prenom,
        ':adresse' => $adresse,
        ':login'   => $login,
        ':mdp'     => password_hash($mdp, PASSWORD_DEFAULT)
    ]);

    $id_newUtilisateur = $conn->lastInsertId();
    echo json_encode(['status' => 'success', 'id' => $id_newUtilisateur]);
}

$conn = null;
?>