<?php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

try {
    $stmtUsers = $conn->prepare("SELECT * FROM users");
    $stmtUsers->execute();
    $users = $stmtUsers->fetchAll(PDO::FETCH_ASSOC);

    $stmtStudents = $conn->prepare("SELECT * FROM students");
    $stmtStudents->execute();
    $students = $stmtStudents->fetchAll(PDO::FETCH_ASSOC);

    $stmtClasses = $conn->prepare("SELECT * FROM classes");
    $stmtClasses->execute();
    $classes = $stmtClasses->fetchAll(PDO::FETCH_ASSOC);

    $stmtSubjects = $conn->prepare("SELECT * FROM subjects");
    $stmtSubjects->execute();
    $subjects = $stmtSubjects->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "users" => $users, 
        "students" => $students, 
        "classes" => $classes,
        "subjects" => $subjects
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch sync data", "message" => $e->getMessage()]);
}
?>
