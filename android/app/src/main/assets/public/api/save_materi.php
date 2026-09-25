<?php
header("Content-Type: application/json; charset=UTF-8");
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON body"]);
    exit;
}

$id = isset($data['id']) ? $data['id'] : null;
$user_id = $data['user_id'];
$subject = $data['subject'];
$class_name = $data['class_name'];
$title = $data['title'];
$description = $data['description'];
$file_name = $data['file_name'];
$status = $data['status'];
$date = $data['date'];
$objectives = isset($data['objectives']) ? $data['objectives'] : [];

try {
    $conn->beginTransaction();

    if ($id) {
        $stmt = $conn->prepare("UPDATE materi_ajar SET subject=?, class_name=?, title=?, description=?, file_name=?, status=?, date=? WHERE id=?");
        $stmt->execute([$subject, $class_name, $title, $description, $file_name, $status, $date, $id]);
        
        $del_stmt = $conn->prepare("DELETE FROM materi_objectives WHERE materi_id=?");
        $del_stmt->execute([$id]);
        $materi_id = $id;
    } else {
        $stmt = $conn->prepare("INSERT INTO materi_ajar (user_id, subject, class_name, title, description, file_name, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $subject, $class_name, $title, $description, $file_name, $status, $date]);
        $materi_id = $conn->lastInsertId();
    }

    $obj_stmt = $conn->prepare("INSERT INTO materi_objectives (materi_id, objective) VALUES (?, ?)");
    foreach ($objectives as $obj) {
        $obj_stmt->execute([$materi_id, $obj]);
    }

    $conn->commit();
    echo json_encode(["status" => "success", "id" => $materi_id]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
