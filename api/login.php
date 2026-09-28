<?php
// api/login.php
header("Content-Type: application/json; charset=UTF-8");
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

$username = isset($data['username']) ? trim($data['username']) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (!empty($username) && !empty($password)) {
    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = :search OR nuptk = :search OR nip = :search OR id = :search LIMIT 1");
        $stmt->execute([':search' => $username]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $isPasswordCorrect = false;
            if (!empty($row['password']) && (strpos($row['password'], '$2a$') === 0 || strpos($row['password'], '$2b$') === 0 || strpos($row['password'], '$2y$') === 0)) {
                $isPasswordCorrect = password_verify($password, $row['password']);
            } else {
                $isPasswordCorrect = ($password === $row['password']);
            }

            if ($isPasswordCorrect) {
                // Parse roles if JSON string
                if (!empty($row['roles'])) {
                    $decoded = json_decode($row['roles'], true);
                    if (is_array($decoded)) {
                        $row['roles'] = $decoded;
                    }
                }
                unset($row['password']); // Never expose password in response
                echo json_encode([
                    "status" => "success",
                    "message" => "Login berhasil.",
                    "user" => $row
                ]);
                exit();
            }
        }
        echo json_encode(["status" => "error", "message" => "Username / NIPTK atau password salah."]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
}
?>
