<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->user_id) && isset($data->avatar_base64)) {
    $userId = $data->user_id;
    $base64_string = $data->avatar_base64;
    
    // Check if valid base64 image
    if (preg_match('/^data:image\/(\w+);base64,/', $base64_string, $type)) {
        $data = substr($base64_string, strpos($base64_string, ',') + 1);
        $type = strtolower($type[1]); // jpg, png, gif
        
        if (!in_array($type, [ 'jpg', 'jpeg', 'gif', 'png' ])) {
            echo json_encode(["status" => "error", "message" => "Invalid image type"]);
            exit;
        }
        
        $data = base64_decode($data);
        
        if ($data === false) {
            echo json_encode(["status" => "error", "message" => "Base64 decode failed"]);
            exit;
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Did not match data URI with image data"]);
        exit;
    }
    
    // Set a path for the image
    $filename = 'user_' . $userId . '_' . time() . '.' . $type;
    $uploadDir = 'uploads/avatars/';
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $filepath = $uploadDir . $filename;
    
    if (file_put_contents($filepath, $data)) {
        // Build URL for avatar
        $dir = dirname($_SERVER['SCRIPT_NAME']);
        if ($dir === '/' || $dir === '\\') {
            $dir = '';
        }
        $avatarUrl = $dir . '/' . $filepath;
        
        $stmt = $conn->prepare("UPDATE users SET avatar = :avatar WHERE id = :id");
        $stmt->bindParam(':avatar', $avatarUrl);
        $stmt->bindParam(':id', $userId);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Avatar updated successfully", "avatar_url" => $avatarUrl]);
        } else {
            echo json_encode(["status" => "error", "message" => "Database update failed"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to save file"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing user_id or avatar_base64"]);
}
?>
