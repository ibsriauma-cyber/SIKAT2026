<?php
// api/get_materi.php
header("Content-Type: application/json; charset=UTF-8");
include_once 'config.php';

$query = "
    SELECT m.id, m.subject, m.class_name as class, m.title, m.description, m.file_name, m.status, m.date,
           u.name, u.role
    FROM materi_ajar m
    JOIN users u ON m.user_id = u.id
    ORDER BY m.date DESC
";

$stmt = $conn->prepare($query);
$stmt->execute();

$materi_list = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    // Ambil objectives untuk materi ini
    $obj_query = "SELECT objective FROM materi_objectives WHERE materi_id = :id";
    $obj_stmt = $conn->prepare($obj_query);
    $obj_stmt->bindParam(':id', $row['id']);
    $obj_stmt->execute();
    
    $objectives = array();
    while ($obj_row = $obj_stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($objectives, $obj_row['objective']);
    }
    
    $row['objectives'] = $objectives;
    
    // Sesuaikan format role dengan frontend
    if($row['role'] == 'guru') $row['category'] = 'guru_mapel';
    else if($row['role'] == 'walas') $row['category'] = 'wali_kelas';
    else if($row['role'] == 'guru_quran') $row['category'] = 'guru_quran';
    else $row['category'] = 'lainnya';

    array_push($materi_list, $row);
}

echo json_encode([
    "status" => "success",
    "data" => $materi_list
]);
?>
