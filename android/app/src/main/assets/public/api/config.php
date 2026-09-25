<?php
// api/config.php

$host = "localhost"; // Di Hostinger biasanya tetap 'localhost'
$db_name = "u988740981_datamaibsriau"; // Ganti dengan nama database Hostinger Anda
$username = "u988740981_maibsriau"; // Ganti dengan user database Hostinger Anda
$password = "MAIBSRiau26"; // Ganti dengan password database Anda

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Header CORS (Cross-Origin Resource Sharing)
    // Diperlukan agar aplikasi React bisa mengambil data dari API PHP
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    
    // Menangani preflight request dari browser
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }
} catch(PDOException $exception) {
    echo json_encode(["status" => "error", "message" => "Connection error: " . $exception->getMessage()]);
    exit();
}
?>
