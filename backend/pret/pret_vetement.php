<?php
session_start();

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
    
    // Soit on choisit l'emprunteur, soit on s'auto-prete
    if (isset($_POST['idutilisateur']) && !empty($_POST['idutilisateur'])) {
        $utilisateur_idutilisateur = $_POST['idutilisateur'];
    } else {
        $utilisateur_idutilisateur = $_SESSION['idutilisateur']; 
    }

    $vetement_datefinpret = $_POST['datefinpret'] ?? null;
    $vetement_datedebut = $_POST['datedebut'] ?? null; 
    $aujourdhui = date('Y-m-d');

    // Pas de dates dans le passé
    if (!empty($vetement_datedebut) && $vetement_datedebut < $aujourdhui) {
        echo json_encode(['status' => 'error', 'message' => 'La date de début ne peut pas être dans le passé.']);
        exit;
    }

    if (!empty($vetement_datefinpret) && $vetement_datefinpret < $aujourdhui) {
        echo json_encode(['status' => 'error', 'message' => 'La date de fin ne peut pas être dans le passé.']);
        exit;
    }

    if (!empty($vetement_datedebut) && !empty($vetement_datefinpret)) {
        if ($vetement_datefinpret < $vetement_datedebut) {
            echo json_encode(['status' => 'error', 'message' => 'La date de fin doit être ultérieure au début.']);
            exit;
        }
    }
    
    $estProprietaire = false;
    
    // On vérifie si l'utilisateur qui fait l'action est le propriétaire du vêtement
    $stmtProprio = $conn->prepare("SELECT idproprietaire FROM vetement WHERE idvetement = ?");
    $stmtProprio->execute([$vetement_idvetement]);
    $idProprio = $stmtProprio->fetchColumn();
    
    if ($idProprio == $_SESSION['idutilisateur']) {
        $estProprietaire = true;
    }

    // Si c'est le proprio qui fait le prêt, c'est direct "En prêt", sinon c'est "Demande en cours" / "En attente"
    $statutpret = $estProprietaire ? 'En prêt' : 'En attente'; 
    $etat_vetement = $estProprietaire ? 'En prêt' : 'Demande en cours';
    
    $conn->beginTransaction();
    try {
        $vetementPretSQL = "UPDATE vetement SET etat = ? WHERE idvetement = ? AND etat = 'Disponible'";
        $stmt = $conn->prepare($vetementPretSQL);
        $stmt->execute([$etat_vetement, $vetement_idvetement]);

        if ($stmt->rowCount() === 0) {
            $conn->rollBack();
            echo json_encode(['status' => 'error', 'message' => 'Impossible de prêter. Le vêtement n\'est plus disponible.']);
            exit;
        }

        $colonnes = "idvetement, idemprunteur, statutpret";
        $valeurs = ":idvetement, :idemprunteur, :statutpret";
        $sqlExecuter = [
            ':idvetement' => $vetement_idvetement,
            ':idemprunteur' => $utilisateur_idutilisateur,
            ':statutpret' => $statutpret
        ];

        // Si le propriétaire valide directement le prêt, la date de début c'est "maintenant"
        if ($estProprietaire && empty($vetement_datedebut)) {
             $vetement_datedebut = date('Y-m-d');
        }

        if (!empty($vetement_datedebut)) {
            $colonnes .= ", datedebut"; 
            $valeurs .= ", :datedebut";
            $sqlExecuter[':datedebut'] = $vetement_datedebut;
        }

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
        echo json_encode(['status' => 'error', 'message' => 'Erreur lors de l\'enregistrement du prêt.']);
    }
}
$conn = null;
?>