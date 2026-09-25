<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

if (isset($_GET['id'])) {
    $userId = $_GET['id'];
    
    $stmt = $conn->prepare("SELECT id, username, name, role, avatar FROM users WHERE id = :id LIMIT 1");
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
            "status" => "success",
            "user" => [
                "id" => $row['id'],
                "username" => $row['username'],
                "name" => $row['name'],
                "role" => $row['role'],
                "avatar" => $row['avatar']
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "User not found"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing user id"]);
}
?>
