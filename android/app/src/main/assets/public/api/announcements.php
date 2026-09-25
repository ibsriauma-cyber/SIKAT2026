<?php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

try {
    $stmt = $conn->prepare("SELECT * FROM announcements ORDER BY created_at DESC");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($rows);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch announcements", "message" => $e->getMessage()]);
}
?>
