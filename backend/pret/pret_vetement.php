<?php
session_start(); // 1. Démarrage de la session

// 2. Vérification de la connexion
if (!isset($_SESSION['idutilisateur'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Non autorisé. Connecte-toi pour emprunter.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $vetement_idvetement = $_POST['idvetement'];
    
    // 3. SÉCURITÉ : On ignore $_POST['idutilisateur'] et on force l'ID de la session
    $utilisateur_idutilisateur = $_SESSION['idutilisateur']; 
    
    $vetement_datefinpret = $_POST['datefinpret'] ?? null;
    $vetement_datedebut = $_POST['datedebut'] ?? null; // NOUVEAU
    
    $statutpret = 'En attente'; 
    $etat_vetement = 'Demande en cours';
    
    $conn->beginTransaction();
    try {
        $vetementPretSQL = "UPDATE vetement SET etat = ? WHERE idvetement = ?";
        $stmt = $conn->prepare($vetementPretSQL);
        $stmt->execute([$etat_vetement, $vetement_idvetement]);

        // Construction dynamique de l'insertion
        $colonnes = "idvetement, idemprunteur, statutpret";
        $valeurs = ":idvetement, :idemprunteur, :statutpret";
        $sqlExecuter = [
            ':idvetement' => $vetement_idvetement,
            ':idemprunteur' => $utilisateur_idutilisateur,
            ':statutpret' => $statutpret
        ];

        // Si une date de début est fournie, elle écrasera le CURRENT_TIMESTAMP
        if (!empty($vetement_datedebut)) {
            $colonnes .= ", datedebut"; 
            $valeurs .= ", :datedebut";
            $sqlExecuter[':datedebut'] = $vetement_datedebut;
        }

        // Si une date de fin est fournie
        if (!empty($vetement_datefinpret)) {
            $colonnes .= ", datefinprevue";
            $valeurs .= ", :datefinprevue";
            $sqlExecuter[':datefinprevue'] = $vetement_datefinpret;
        }

        $pretInsertSQL = "INSERT INTO pret ($colonnes) VALUES ($valeurs)";
        $stmt = $conn->prepare($pretInsertSQL);
        $stmt->execute($sqlExecuter);

        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>