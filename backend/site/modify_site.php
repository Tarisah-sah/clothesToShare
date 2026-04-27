<?php
session_start();
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');
$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['idSite'] ?? null;
    $nom = trim($_POST['nom'] ?? '');
    $adresse = trim($_POST['adresse'] ?? '');
    $code_postal = trim($_POST['code_postal'] ?? '');
    $localite = trim($_POST['localite'] ?? '');

    if (empty($nom)) {
        echo json_encode(['status' => 'error', 'message' => 'Le nom du site est obligatoire.']);
        exit;
    }

    if (empty($adresse)) {
        echo json_encode(['status' => 'error', 'message' => 'L adresse du site est obligatoire.']);
        exit;
    }

    if (empty($code_postal)) {
        echo json_encode(['status' => 'error', 'message' => 'Le code postal du site est obligatoire.']);
        exit;
    }

    if (empty($localite)) {
        echo json_encode(['status' => 'error', 'message' => 'La localite du site est obligatoire.']);
        exit;
    }

    $sql = "UPDATE site SET nom = :nom, adresse = :adresse, code_postal = :code_postal, localite = :localite";
    $params = [
        ':nom' => $nom, 
        ':adresse' => $adresse, 
        ':code_postal' => $code_postal, 
        ':localite' => $localite,
        ':id' => $id
    ]
    
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        // A. On va d'abord chercher l'ancienne photo pour pouvoir la supprimer plus tard
        $stmtOld = $conn->prepare("SELECT photo FROM site WHERE idSite = :id");
        $stmtOld->execute([':id' => $idSite]);
        $oldData = $stmtOld->fetch();

        // B. On sauvegarde la nouvelle image
        $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $nomFichier = uniqid('site_') . '.' . $extension;
        $chemin_db = 'assets/img/site/' . $nomFichier;
        $chemin_physique = '../../' . $chemin_db;

        if (move_uploaded_file($_FILES['photo']['tmp_name'], $chemin_physique)) {
            // C. On ajoute la modification de la photo à la requête SQL
            $sql .= ", photo = :photo";
            $params[':photo'] = $chemin_db;

            // D. On supprime physiquement l'ancienne image du serveur !
            if ($oldData && !empty($oldData['photo']) && file_exists('../../' . $oldData['photo'])) {
                unlink('../../' . $oldData['photo']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Impossible de sauvegarder l\'image.']);
            exit;
        }
    }

    // 3. On finalise et exécute la requête
    $sql .= " WHERE idSite = :id";

    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>