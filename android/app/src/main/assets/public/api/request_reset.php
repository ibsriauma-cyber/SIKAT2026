<?php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents("php://input"), true);
$username = isset($data['username']) ? $data['username'] : '';

if (!$username) {
    echo json_encode(["status" => "success"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? OR id = ?");
    $stmt->execute([$username, $username]);
    $userList = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($userList) > 0) {
        $u = $userList[0];
        $title = 'Permintaan Reset Password';
        $message = "Pengguna " . $u['name'] . " (" . $u['username'] . ") meminta reset password.";
        $type = 'warning';
        
        $stmtInsert = $conn->prepare("INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES (1, ?, ?, ?, 0, NOW())");
        $stmtInsert->execute([$title, $message, $type]);
    }
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
