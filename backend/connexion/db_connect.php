<?php
function pdo_connectDB() {
    $host    = "localhost";
    $db      = "clothet53";
    $user    = "root";
    $pass    = ""; 
    $charset = "utf8mb4";

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (\PDOException $e) {
        // Sécurité : On ne renvoie pas $e->getMessage() qui contient des infos sensibles
        header('Content-Type: application/json');
        echo json_encode(["status" => "error", "message" => "Impossible de se connecter à la base de données."]);
        exit;
    }
}
?>