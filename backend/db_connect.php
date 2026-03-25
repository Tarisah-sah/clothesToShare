<?php
// Configuration pour OVH Starter
$host = 'clothet53.mysql.db'; // Fourni par OVH dans votre interface
$db   = 'clothet53';
$user = 'clothet53';
$pass = 'mdp';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     // En cas d'erreur, on renvoie un JSON pour ne pas casser l'AJAX
     header('Content-Type: application/json');
     echo json_encode(["error" => "Erreur de connexion à la base"]);
     exit;
}
?>