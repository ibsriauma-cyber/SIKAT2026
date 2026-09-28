<?php
// api/announcements.php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM announcements ORDER BY created_at DESC");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $formatted = array_map(function($r) {
            return [
                "id" => (string)$r['id'],
                "title" => $r['title'] ?? '',
                "content" => $r['content'] ?? '',
                "category" => $r['category'] ?? 'Informasi',
                "target" => $r['target'] ?? $r['target_audience'] ?? 'Semua',
                "date" => $r['date'] ?? $r['created_at'] ?? date('Y-m-d'),
                "isPublished" => true
            ];
        }, $rows);
        echo json_encode($formatted);
    } elseif ($method === 'POST') {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);
        $title = $data['title'] ?? '';
        $content = $data['content'] ?? '';
        $target = $data['target'] ?? $data['target_audience'] ?? 'Semua';

        $stmt = $conn->prepare("INSERT INTO announcements (title, content, target_audience, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$title, $content, $target]);
        echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
    } elseif ($method === 'PUT') {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);
        $id = $data['id'] ?? '';
        $title = $data['title'] ?? '';
        $content = $data['content'] ?? '';
        $target = $data['target'] ?? $data['target_audience'] ?? 'Semua';

        $stmt = $conn->prepare("UPDATE announcements SET title = ?, content = ?, target_audience = ? WHERE id = ?");
        $stmt->execute([$title, $content, $target, $id]);
        echo json_encode(["status" => "success"]);
    } elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        if (!$id) {
            $raw = file_get_contents("php://input");
            $data = json_decode($raw, true);
            $id = $data['id'] ?? '';
        }
        if ($id) {
            $stmt = $conn->prepare("DELETE FROM announcements WHERE id = ?");
            $stmt->execute([$id]);
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
