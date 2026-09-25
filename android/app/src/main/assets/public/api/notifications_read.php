<?php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

$id = isset($_GET['id']) ? $_GET['id'] : '';

if (!$id) {
    echo json_encode(["status" => "success"]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
