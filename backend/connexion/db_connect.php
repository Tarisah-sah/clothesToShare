<?php
function pdo_connectDB() {
    $host    = "clothet53.mysql.db";
    $db   = 'clothet53';
    $user = 'clothet53';
    $pass = 'TMProjet20266202';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (\PDOException $e) {
        // On renvoie un message d'erreur générique pour la sécurité.
        header('Content-Type: application/json');
        echo json_encode(["status" => "error", "message" => "Impossible de se connecter à la base de données."]);
        exit;
    }
}
?>