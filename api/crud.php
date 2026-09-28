<?php
// api/crud.php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER['REQUEST_METHOD'];
$table = isset($_GET['table']) ? trim($_GET['table']) : '';
$id = isset($_GET['id']) ? trim($_GET['id']) : '';

$allowedTables = [
    'academic_history', 'academic_terms', 'agenda', 'announcements', 'bk_cases',
    'cbt_exams', 'cbt_questions', 'cbt_submissions', 'classes', 'grades',
    'ibadah_guru', 'ibadah_siswa', 'kinerja_staf', 'leave_requests', 'materi_ajar', 'materi_objectives',
    'notifications', 'sarpras', 'schedules', 'student_attendance', 'students', 'pemantauan_pagi', 'nilai_sikap',
    'subjects', 'teacher_attendance', 'laporan_harian', 'teaching_assignments', 'users', 'key_value_store'
];

if (!in_array($table, $allowedTables)) {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden table: " . htmlspecialchars($table)]);
    exit();
}

try {
    if ($method == 'GET') {
        if ($id !== '') {
            $stmt = $conn->prepare("SELECT * FROM `$table` WHERE id = ? LIMIT 1");
            $stmt->execute([$id]);
            $res = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($res ?: null);
        } else {
            $stmt = $conn->prepare("SELECT * FROM `$table`");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    } elseif ($method == 'POST') {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);
        if (!$data || !is_array($data)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON body"]);
            exit();
        }

        // Get actual columns in table
        $colsStmt = $conn->query("SHOW COLUMNS FROM `$table`");
        $validCols = $colsStmt->fetchAll(PDO::FETCH_COLUMN);

        $insertData = [];
        foreach ($data as $key => $val) {
            if (in_array($key, $validCols)) {
                $insertData[$key] = is_array($val) ? json_encode($val) : $val;
            }
        }

        if (empty($insertData)) {
            http_response_code(400);
            echo json_encode(["error" => "No valid columns provided"]);
            exit();
        }

        $keys = array_keys($insertData);
        $values = array_values($insertData);
        $placeholders = implode(',', array_fill(0, count($keys), '?'));
        $columns = implode(',', array_map(function($k) { return "`$k`"; }, $keys));

        $sql = "REPLACE INTO `$table` ($columns) VALUES ($placeholders)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($values);
        $insertId = $conn->lastInsertId() ?: ($insertData['id'] ?? null);
        echo json_encode(["status" => "success", "insertId" => $insertId, "id" => $insertId]);

    } elseif ($method == 'PUT') {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);
        if (!$data || !is_array($data)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON body"]);
            exit();
        }

        if ($id === '' && isset($data['id'])) {
            $id = $data['id'];
        }

        if ($id === '') {
            http_response_code(400);
            echo json_encode(["error" => "Missing ID for update"]);
            exit();
        }

        $colsStmt = $conn->query("SHOW COLUMNS FROM `$table`");
        $validCols = $colsStmt->fetchAll(PDO::FETCH_COLUMN);

        $updateData = [];
        foreach ($data as $key => $val) {
            if (in_array($key, $validCols) && $key !== 'id') {
                $updateData[$key] = is_array($val) ? json_encode($val) : $val;
            }
        }

        if (!empty($updateData)) {
            $keys = array_keys($updateData);
            $values = array_values($updateData);
            $setClause = implode(', ', array_map(function($k) { return "`$k` = ?"; }, $keys));
            $sql = "UPDATE `$table` SET $setClause WHERE `id` = ?";
            $values[] = $id;
            $stmt = $conn->prepare($sql);
            $stmt->execute($values);
        }

        echo json_encode(["status" => "success", "affectedRows" => 1]);

    } elseif ($method == 'DELETE') {
        if ($id === '') {
            $raw = file_get_contents("php://input");
            $data = json_decode($raw, true);
            if (isset($data['id'])) $id = $data['id'];
        }

        if ($id === '') {
            http_response_code(400);
            echo json_encode(["error" => "Missing ID for delete"]);
            exit();
        }

        $sql = "DELETE FROM `$table` WHERE `id` = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id]);
        echo json_encode(["status" => "success", "affectedRows" => $stmt->rowCount()]);
    } else {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
