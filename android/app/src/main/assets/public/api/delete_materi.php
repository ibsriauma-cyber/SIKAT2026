<?php
header("Content-Type: application/json; charset=UTF-8");
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['id'])) {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

$id = $data['id'];

try {
    $conn->beginTransaction();
    $del_obj = $conn->prepare("DELETE FROM materi_objectives WHERE materi_id=?");
    $del_obj->execute([$id]);

    $del_mat = $conn->prepare("DELETE FROM materi_ajar WHERE id=?");
    $del_mat->execute([$id]);

    $conn->commit();
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
