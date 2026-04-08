<?php
header('Content-Type: application/json; charset=utf-8');
include('../connexion/db_connect.php');

$conn = pdo_connectDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $vetement_new = isset($_POST['vetement_new']) ? $_POST['vetement_new'] : [];
	
    $conn->beginTransaction();
    try {
        // --- NOUVEAUTÉ : VERIFICATION STRICTE ---
        if (empty(trim($vetement_new['description']))) {
            throw new Exception("La description est obligatoire et ne peut pas être vide.");
        }

        if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Aucune image reçue ou l'image est trop lourde.");
        }

        $nomFichier = preg_replace('/[^a-zA-Z0-9.\-_]/', '', basename($_FILES['photo']['name']));
        $vetement_chemin_db = 'assets/img/wardrobe/' . $nomFichier;
        $vetement_chemin_physique = '../../' . $vetement_chemin_db;

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
            ':photo' => $vetement_chemin_db,
            ':idcategorie' => $vetement_new['idcategorie'],
            ':idniveau' => $vetement_new['idniveau'],
            ':idproprietaire' => $vetement_new['idproprietaire']
        ]);
        
        $id_newVetement = $conn->lastInsertId();

        // --- NOUVEAUTÉ : GESTION DU PRÊT ---
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

        if (!move_uploaded_file($_FILES['photo']['tmp_name'], $vetement_chemin_physique)) {
            throw new Exception("Impossible de sauvegarder l'image.");
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