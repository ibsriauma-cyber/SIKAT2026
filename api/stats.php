<?php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

try {
    $stmtUsers = $conn->prepare("SELECT COUNT(*) as total FROM users");
    $stmtUsers->execute();
    $totalUsers = $stmtUsers->fetch(PDO::FETCH_ASSOC)['total'];

    $stmtClasses = $conn->prepare("SELECT COUNT(*) as total FROM classes");
    $stmtClasses->execute();
    $activeClasses = $stmtClasses->fetch(PDO::FETCH_ASSOC)['total'];

    $stmtTeachers = $conn->prepare("SELECT COUNT(*) as total FROM users WHERE role IN ('guru', 'walas', 'guru_quran')");
    $stmtTeachers->execute();
    $totalTeachers = $stmtTeachers->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        "totalUsers" => $totalUsers,
        "activeClasses" => $activeClasses,
        "totalTeachers" => $totalTeachers
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch stats", "message" => $e->getMessage()]);
}
?>
