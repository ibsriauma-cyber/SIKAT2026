<?php
require_once "api/db.php";
$stmt = $conn->query("DESCRIBE schedules");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
