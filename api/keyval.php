<?php
// api/keyval.php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER['REQUEST_METHOD'];
$key = isset($_GET['key']) ? trim($_GET['key']) : '';

try {
    if ($method === 'GET') {
        if ($key !== '') {
            $stmt = $conn->prepare("SELECT v FROM `key_value_store` WHERE `k` = ? LIMIT 1");
            $stmt->execute([$key]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(["value" => $row ? $row['v'] : null]);
        } else {
            $stmt = $conn->query("SELECT `k`, `v` FROM `key_value_store`");
            $all = [];
            while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $all[$r['k']] = $r['v'];
            }
            echo json_encode($all);
        }
    } elseif ($method === 'POST') {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);
        $k = isset($data['key']) ? trim($data['key']) : '';
        $v = isset($data['value']) ? (string)$data['value'] : '';

        if ($k === '') {
            http_response_code(400);
            echo json_encode(["error" => "Missing key"]);
            exit();
        }

        $stmt = $conn->prepare("REPLACE INTO `key_value_store` (`k`, `v`) VALUES (?, ?)");
        $stmt->execute([$k, $v]);
        echo json_encode(["status" => "success"]);
    } elseif ($method === 'DELETE') {
        if ($key !== '') {
            $stmt = $conn->prepare("DELETE FROM `key_value_store` WHERE `k` = ?");
            $stmt->execute([$key]);
        } else {
            $conn->exec("DELETE FROM `key_value_store`");
        }
        echo json_encode(["status" => "success"]);
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
