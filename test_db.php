<?php
include_once 'api/config.php';
$stmt = $conn->prepare("UPDATE materi_ajar SET status = 'Sudah Membuat' WHERE status = ''");
$stmt->execute();
echo "Updated " . $stmt->rowCount() . " rows\n";
?>
