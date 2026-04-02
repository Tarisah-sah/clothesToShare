<?php
include('../connexion/db_connect.php');

$conn=pdo_connectDB();

// Afficher tous les vetements qui correspond a la recherche
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$utilisateur_nom = $_POST['nom'];
	$utilisateur_prenom = $_POST['prenom'];
	$utilisateur_adresse = $_POST['adresse'];
	$utilisateur_email = $_POST['email'];
	$utilisateur_login = $_POST['login'];
	$utilisateur_mdp = $_POST['mdp'];
	$utilisateur_role = $_POST['role'];

    $conn->beginTransaction();
    try {
        $utilisateurModifSQL = "UPDATE utilisateur SET";
        $params = [];
        if (!empty($utilisateur_nom)) {
            $utilisateurModifSQL .= "nom = :nom, ";
            $params[':nom'] = $utilisateur_nom;
        }
        if (!empty($utilisateur_prenom)) {
            $utilisateurModifSQL .= "prenom = :prenom, ";
            $params[':prenom'] = $utilisateur_prenom;
        }
        if (!empty($utilisateur_adresse)) {
            $utilisateurModifSQL .= "adresse = :adresse, ";
            $params[':adresse'] = $utilisateur_adresse;
        }
        if (!empty($utilisateur_email)) {
            $utilisateurModifSQL .= "email = :email, ";
            $params[':email'] = $utilisateur_email;
        }
        if (!empty($utilisateur_login)) {
            $utilisateurModifSQL .= "login = :login, ";
            $params[':login'] = $utilisateur_login;
        }
        if (!empty($utilisateur_mdp)) {
            $utilisateurModifSQL .= "mdp = :mdp, ";
            $params[':mdp'] = $utilisateur_mdp;
        }
        if (!empty($utilisateur_role)) {
            $utilisateurModifSQL .= "role = :role, ";
            $params[':role'] = $utilisateur_role;
        }

        // Supprimer la dernière virgule et espace
        $utilisateurModifSQL = rtrim($utilisateurModifSQL, ", ");
        $utilisateurModifSQL .= " WHERE idutilisateur = :idutilisateur";
        $params[':idutilisateur'] = $utilisateur_idutilisateur;
        $stmt = $conn->prepare($utilisateurModifSQL);
        $stmt->execute($params);
        
        $conn->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

$conn=null;
?>