<?php
session_start();

if (!isset($_SESSION['idutilisateur'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Non autorisé.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idvetement = $_POST['idvetement'] ?? null;
    $action = $_POST['action'] ?? null;

    if (!$idvetement || !$action) {
        echo json_encode(['status' => 'error', 'message' => 'Données manquantes.']);
        exit;
    }

    try {
        if ($action === 'laver') {
            // Le vêtement est lavé, il redevient disponible pour tout le monde
            $nouvelEtat = 'Disponible';
            $stmt = $conn->prepare("UPDATE vetement SET etat = ? WHERE idvetement = ?");
            $stmt->execute([$nouvelEtat, $idvetement]);
            
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Action non reconnue.']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la modification de l\'état.']);
    }
}
$conn = null;
?>