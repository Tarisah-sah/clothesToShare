<?php
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');
$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $idNiveau = $_POST['idNiveau'] ?? null;
    $nom = trim($_POST['nom'] ?? '');
    $infoNiveau = trim($_POST['infoNiveau'] ?? '');
    $idRangement = $_POST['idRangement'] ?? null;

    // 1. On prépare la requête de base (SANS la photo)
    $sql = "UPDATE niveau SET nom = ?, infoNiveau = ?, idRangement = ?";
    $params = [
        $nom, 
        $infoNiveau, 
        $idRangement, 
        $idNiveau
    ];

    // 2. Si une NOUVELLE photo est envoyée
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        
        // A. On va d'abord chercher l'ancienne photo pour pouvoir la supprimer plus tard
        $stmtOld = $conn->prepare("SELECT photo FROM niveau WHERE idNiveau = :id");
        $stmtOld->execute([':id' => $idNiveau]);
        $oldData = $stmtOld->fetch();

        // B. On sauvegarde la nouvelle image
        $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $nomFichier = uniqid('niveau_') . '.' . $extension;
        $chemin_db = 'assets/img/niveau/' . $nomFichier;
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
    $sql .= " WHERE idNiveau = :id";

    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }

}
?>