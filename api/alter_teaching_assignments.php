<?php
require_once "config.php";
try {
    $conn->exec("ALTER TABLE \`teaching_assignments\` ADD COLUMN \`role\` VARCHAR(50) DEFAULT 'guru'");
    echo "Success!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
