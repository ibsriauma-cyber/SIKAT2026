<?php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';

if (!$user_id) {
    echo json_encode([]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($rows);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
