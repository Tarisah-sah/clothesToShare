<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // On lit le JSON envoyé par Javascript
    $data = json_decode(file_get_contents('php://input'), true);

    $email   = trim($data['email']   ?? '');
    $nom     = trim($data['nom']     ?? '');
    $prenom  = trim($data['prenom']  ?? '');
    $adresse = trim($data['adresse'] ?? '');
    $login   = trim($data['login']   ?? '');
    $mdp     = $data['mdp']          ?? '';

    if (!$email || !$nom || !$prenom || !$adresse || !$login || !$mdp) {
        echo json_encode(['status' => 'error', 'message' => 'Tous les champs sont obligatoires.']);
        exit;
    }

    // Vérifier si le login ou l'email est déjà pris
    $checkSQL = "SELECT COUNT(*) FROM utilisateur WHERE email = :email OR login = :login";
    $stmt = $conn->prepare($checkSQL);
    $stmt->execute([':email' => $email, ':login' => $login]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Cet email ou ce login est déjà utilisé.']);
        exit;
    }

    // mdp Hashé
    $mdp_hash = password_hash($mdp, PASSWORD_DEFAULT);

    try {
        // Insertion avec role = 'pending' et le mot de passe hashé
        $sql = "INSERT INTO utilisateur (email, nom, prenom, adresse, login, mdp, role)
                VALUES (:email, :nom, :prenom, :adresse, :login, :mdp, 'pending')";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':email'   => $email,
            ':nom'     => $nom,
            ':prenom'  => $prenom,
            ':adresse' => $adresse,
            ':login'   => $login,
            ':mdp'     => $mdp_hash
        ]);

        $id_newUtilisateur = $conn->lastInsertId();
        echo json_encode(['status' => 'success', 'id' => $id_newUtilisateur]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => "Erreur lors de l'insertion."]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée.']);
}

$conn = null;
?>