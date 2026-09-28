<?php
// api/health.php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

try {
    $stmt = $conn->query("SELECT 1 as ping");
    $res = $stmt->fetch();
    echo json_encode([
        "status" => "ok",
        "database" => "mysql_hostinger",
        "connected" => true,
        "message" => "MySQL Database Active"
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
