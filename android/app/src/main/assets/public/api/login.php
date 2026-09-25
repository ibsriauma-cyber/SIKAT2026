<?php
// api/login.php
header("Content-Type: application/json; charset=UTF-8");
include_once 'config.php';

// Auto-migrate to support roles column if it doesn't exist yet
try {
    $check_roles = $conn->query("SHOW COLUMNS FROM `users` LIKE 'roles'");
    if ($check_roles && $check_roles->rowCount() == 0) {
        $conn->exec("ALTER TABLE `users` ADD `roles` VARCHAR(255) NULL AFTER `role`");
        $conn->exec("UPDATE `users` SET `roles` = CONCAT('[\"', role, '\"]') WHERE `role` IS NOT NULL");
    }
} catch (Exception $e) {}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    $query = "SELECT id, username, name, role, roles, avatar, password FROM users WHERE username = :username LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':username', $data->username);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Cek password. Kita periksa apakah itu hash bcrypt atau plain-text 12345 (untuk fallback)
        $isPasswordCorrect = false;
        if (password_verify($data->password, $row['password'])) {
            $isPasswordCorrect = true;
        } else if ($data->password === $row['password']) {
            $isPasswordCorrect = true;
            // Optionally we could hash it here and update the db
        }

        if ($isPasswordCorrect) {
            $roles = [];
            if (!empty($row['roles'])) {
                $decoded = json_decode($row['roles'], true);
                if (is_array($decoded)) {
                    $roles = $decoded;
                }
            }
            if (empty($roles) && !empty($row['role'])) {
                $roles = [$row['role']];
            }
            
            echo json_encode([
                "status" => "success",
                "message" => "Login berhasil.",
                "user" => [
                    "id" => $row['id'],
                    "username" => $row['username'],
                    "name" => $row['name'],
                    "role" => $row['role'],
                    "roles" => $roles,
                    "avatar" => $row['avatar']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Username atau password salah."]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Username atau password salah."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
}
?>
