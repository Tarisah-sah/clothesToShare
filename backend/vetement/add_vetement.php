<?php
// 1. On démarre la session
session_start();

// SÉCURITÉ : On bloque immédiatement si la personne n'est pas connectée OU si elle n'a que le rôle "user"
if (!isset($_SESSION['idutilisateur']) || $_SESSION['role'] === 'user') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Accès refusé. Ton rôle ne te permet pas de modifier la garde-robe.']);
    exit;
}

// 2. On vérifie que la personne est bien connectée
if (!isset($_SESSION['idutilisateur'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Non autorisé. Veuillez vous connecter.']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $vetement_new = isset($_POST['vetement_new']) ? $_POST['vetement_new'] : [];
    
    // 3. LA SÉCURITÉ : On écrase l'idproprietaire envoyé par le JS
    $vetement_new['idproprietaire'] = $_SESSION['idutilisateur'];
    
    $conn->beginTransaction();
    try {
        if (empty(trim($vetement_new['description']))) {
            throw new Exception("La description est obligatoire et ne peut pas être vide.");
        }

        // --- GESTION DE L'IMAGE AMÉLIORÉE (Avec ID Unique) ---
        $vetement_chemin_db = ''; // Par défaut, vide
        
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            // On récupère l'extension de l'image originale
            $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
            
            // On génère un nom 100% unique (ex: v_60a3f8c... .jpg)
            $nomFichier = uniqid('v_') . '.' . $extension;
            
            $vetement_chemin_db = 'assets/img/wardrobe/' . $nomFichier;
            $vetement_chemin_physique = '../../' . $vetement_chemin_db;

            // On déplace le fichier tout de suite, avant l'insertion SQL
            if (!move_uploaded_file($_FILES['photo']['tmp_name'], $vetement_chemin_physique)) {
                throw new Exception("Impossible de sauvegarder l'image sur le serveur.");
            }
        }
        // --------------------------------------------------------

        $vetementAjoutSQL = "INSERT INTO 
            vetement (nom, taille, type, description, couleur, etat, genre, marque, photo, idcategorie, idniveau, idproprietaire) VALUES 
            (:nom, :taille, :type, :description, :couleur, :etat, :genre, :marque, :photo, :idcategorie, :idniveau, :idproprietaire)
        ";
        
        $stmt = $conn->prepare($vetementAjoutSQL);
        $stmt->execute([
            ':nom' => $vetement_new['nom'],
            ':taille' => $vetement_new['taille'],
            ':type' => $vetement_new['type'],
            ':description' => trim($vetement_new['description']),
            ':couleur' => $vetement_new['couleur'],
            ':etat' => $vetement_new['etat'],
            ':genre' => $vetement_new['genre'],
            ':marque' => $vetement_new['marque'],
            ':photo' => $vetement_chemin_db, // Soit le chemin généré, soit du vide
            ':idcategorie' => $vetement_new['idcategorie'],
            ':idniveau' => $vetement_new['idniveau'],
            ':idproprietaire' => $vetement_new['idproprietaire']
        ]);
        
        $id_newVetement = $conn->lastInsertId();

        // --- GESTION DU PRÊT ---
        if ($vetement_new['etat'] === 'En prêt') {
            if (empty($vetement_new['idemprunteur']) || empty($vetement_new['datefinprevue'])) {
                throw new Exception("Pour un vêtement en prêt, l'emprunteur et la date de fin sont obligatoires.");
            }
            
            $pretInsertSQL = "INSERT INTO pret (idvetement, idemprunteur, datefinprevue, statutpret) VALUES (:idvetement, :idemprunteur, :datefinprevue, 'En prêt')";
            $stmtPret = $conn->prepare($pretInsertSQL);
            $stmtPret->execute([
                ':idvetement' => $id_newVetement,
                ':idemprunteur' => $vetement_new['idemprunteur'],
                ':datefinprevue' => $vetement_new['datefinprevue']
            ]);
        }

        $conn->commit();
        echo json_encode(['status' => 'success', 'id' => $id_newVetement]);

    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
$conn = null;
?>