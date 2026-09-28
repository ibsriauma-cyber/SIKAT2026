<?php
// api/kinerja_bundle.php
require_once "config.php";
header("Content-Type: application/json; charset=UTF-8");

try {
    function fetchAllTable($conn, $table) {
        $stmt = $conn->query("SELECT * FROM `$table`");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    $data = [
        "users" => fetchAllTable($conn, "users"),
        "kinerja" => fetchAllTable($conn, "kinerja_staf"),
        "schedules" => fetchAllTable($conn, "schedules"),
        "assignments" => fetchAllTable($conn, "teaching_assignments"),
        "studentAttendance" => fetchAllTable($conn, "student_attendance"),
        "pemantauanPagi" => fetchAllTable($conn, "pemantauan_pagi"),
        "nilaiSikap" => fetchAllTable($conn, "nilai_sikap"),
        "ibadahSiswa" => fetchAllTable($conn, "ibadah_siswa"),
        "laporanHarian" => fetchAllTable($conn, "laporan_harian"),
        "materiAjar" => fetchAllTable($conn, "materi_ajar"),
        "classes" => fetchAllTable($conn, "classes")
    ];

    echo json_encode([
        "status" => "success",
        "data" => $data
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
