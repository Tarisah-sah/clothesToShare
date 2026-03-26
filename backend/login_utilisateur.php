<?php
include('db_connect.php');

$conn=pdo_connectDB();  

// Detecte login d'un utilisateur
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$email = $_POST['login'];
	$mdpEntre = $_POST['mdp'];

	// Rechercher l'utilisateur
	$sql = "SELECT id, prenom, email, mdp FROM utilisateur WHERE login = ?";
	$stmt = $conn->prepare($sql);
	$stmt->execute([$email]);
	$utilisateur = $stmt->fetch();

	$res = array(
		'reussi' => ($utilisateur && password_verify($mdpEntre, $utilisateur['mdp'])),
		'utilisateurNonExistant' => empty($utilisateur),
		'mdpVerif' => password_verify($mdpEntre, $utilisateur['mdp'])
	);
	
	if ($res['reussi']) {
		$res['message'] = "Connexion réussie ✅ Bienvenue " . $utilisateur['nom'];
	} else {
		$res['message'] = "⚠️ Login ou mot de passe incorrect";
	}
	
	echo json_encode($res);
}

$conn=null;
?>