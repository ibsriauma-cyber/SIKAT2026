<?php
require_once 'config.php';

try {
    $stmt = $conn->query("SELECT 1");
    if ($stmt) {
        echo json_encode(["status" => "success", "message" => "Koneksi database berhasil! API siap digunakan."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Koneksi database berhasil, tetapi query gagal."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Gagal mengecek database: " . $e->getMessage()]);
}
?>
