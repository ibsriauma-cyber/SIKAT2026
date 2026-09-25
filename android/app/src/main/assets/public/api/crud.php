<?php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER['REQUEST_METHOD'];
$table = isset($_GET['table']) ? $_GET['table'] : '';
$id = isset($_GET['id']) ? $_GET['id'] : '';

$allowedTables = ['academic_history', 'academic_terms', 'agenda', 'announcements', 'bk_cases', 'cbt_exams', 'cbt_questions', 'cbt_submissions', 'classes', 'grades', 'kinerja_staf', 'leave_requests', 'materi_ajar', 'materi_objectives', 'notifications', 'sarpras', 'schedules', 'student_attendance', 'students', 'pemantauan_pagi', 'subjects', 'teacher_attendance', 'teaching_assignments', 'users'];

if (!in_array($table, $allowedTables)) {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden table"]);
    exit;
}

try {
    if ($method == 'GET') {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM `$table` WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            $stmt = $conn->prepare("SELECT * FROM `$table`");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    } elseif ($method == 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON body"]);
            exit;
        }
        $keys = array_keys($data);
        $values = array_values($data);
        $placeholders = implode(',', array_fill(0, count($keys), '?'));
        $columns = implode(',', array_map(function($k) { return "`$k`"; }, $keys));
        
        $sql = "INSERT INTO `$table` ($columns) VALUES ($placeholders)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($values);
        echo json_encode(["status" => "success", "insertId" => $conn->lastInsertId()]);
    } elseif ($method == 'PUT') {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Missing ID for update"]);
            exit;
        }
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON body"]);
            exit;
        }
        $keys = array_keys($data);
        $values = array_values($data);
        $setClause = implode(', ', array_map(function($k) { return "`$k` = ?"; }, $keys));
        
        $sql = "UPDATE `$table` SET $setClause WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $values[] = $id;
        $stmt->execute($values);
        echo json_encode(["status" => "success"]);
    } elseif ($method == 'DELETE') {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Missing ID for delete"]);
            exit;
        }
        $sql = "DELETE FROM `$table` WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id]);
        echo json_encode(["status" => "success"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
