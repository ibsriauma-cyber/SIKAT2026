-- ========================================================
-- DATABASE SCHEMA & INITIAL SEED DATA FOR MADRASAH APPLICATION
-- Compatible with Hostinger (MySQL / MariaDB)
-- ========================================================

-- Disable foreign key checks temporarily to drop tables in any order
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `agenda`;
DROP TABLE IF EXISTS `key_value_store`;
DROP TABLE IF EXISTS `materi_objectives`;
DROP TABLE IF EXISTS `materi_ajar`;
DROP TABLE IF EXISTS `kinerja_staf`;
DROP TABLE IF EXISTS `academic_terms`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `announcements`;
DROP TABLE IF EXISTS `sarpras`;
DROP TABLE IF EXISTS `cbt_submissions`;
DROP TABLE IF EXISTS `cbt_questions`;
DROP TABLE IF EXISTS `cbt_exams`;
DROP TABLE IF EXISTS `bk_cases`;
DROP TABLE IF EXISTS `academic_history`;
DROP TABLE IF EXISTS `grades`;
DROP TABLE IF EXISTS `leave_requests`;
DROP TABLE IF EXISTS `teacher_attendance`;
DROP TABLE IF EXISTS `student_attendance`;
DROP TABLE IF EXISTS `schedules`;
DROP TABLE IF EXISTS `teaching_assignments`;
DROP TABLE IF EXISTS `subjects`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `classes`;
DROP TABLE IF EXISTS `users`;


-- ==========================================
-- 1. TABEL USERS (PENGGUNA / STAF / WALI MURID)
-- ==========================================
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL, -- Di produksi, gunakan hash (bcrypt atau plain-text disesuaikan)
  `name` varchar(100) NOT NULL,
  `role` enum('admin', 'kamad', 'guru', 'walas', 'guru_quran', 'ortu', 'bk', 'pustaka', 'wakakurikulum', 'wakakesiswaan', 'siswa', 'tendik') NOT NULL,
  `roles` json DEFAULT NULL, -- Multi-role support
  `nuptk` varchar(50) DEFAULT NULL, -- NIPTK/NUPTK
  `gender` enum('L', 'P') DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `class_name` varchar(50) DEFAULT NULL, -- Kelas binaan (untuk Wali Kelas)
  `child_id` int(11) DEFAULT NULL, -- Menghubungkan orang tua ke siswa
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 2. TABEL KELAS (CLASSES)
-- ==========================================
CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `wali_kelas_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  FOREIGN KEY (`wali_kelas_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 3. TABEL SISWA (STUDENTS)
-- ==========================================
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL, -- Menghubungkan siswa ke akun login jika ada
  `name` varchar(100) NOT NULL,
  `nis` varchar(20) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `gender` enum('L', 'P') NOT NULL,
  `parent_id` int(11) DEFAULT NULL, -- Menghubungkan siswa ke akun Orang Tua
  `behavior_score` int(11) DEFAULT 100, -- Nilai Sikap / Karakter
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nis` (`nis`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 4. TABEL MATA PELAJARAN (SUBJECTS)
-- ==========================================
CREATE TABLE `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` enum('Wajib', 'Muatan Lokal', 'Pilihan') DEFAULT 'Wajib',
  `weekly_hours` int(11) DEFAULT 2,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 5. TABEL DISTRIBUSI MENGAJAR (TEACHING ASSIGNMENTS)
-- ==========================================
CREATE TABLE `teaching_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 6. TABEL JADWAL PELAJARAN (SCHEDULES)
-- ==========================================
CREATE TABLE `schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_name` varchar(50) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `day` varchar(20) NOT NULL, -- 'Senin', 'Selasa', 'Rabu', etc.
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 7. TABEL ABSENSI SISWA (STUDENT ATTENDANCE)
-- ==========================================
CREATE TABLE `student_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `student_name` varchar(150),
  `class_name` varchar(50) NOT NULL,
  `subject_name` varchar(100),
  `user_id` int(11),
  `date` date NOT NULL,
  `status` enum('Hadir', 'Sakit', 'Izin', 'Alpa') NOT NULL,
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 8. TABEL ABSENSI GURU / STAF (TEACHER ATTENDANCE)
-- ==========================================
CREATE TABLE `teacher_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `status` enum('Hadir', 'Sakit', 'Izin', 'Alpa') NOT NULL DEFAULT 'Hadir',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 9. TABEL PERIZINAN GURU / STAF (LEAVE REQUESTS)
-- ==========================================
CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` enum('sakit', 'izin_pribadi', 'dinas_luar') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 10. TABEL NILAI SISWA (GRADES)
-- ==========================================
CREATE TABLE `grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `academic_year` varchar(20) NOT NULL, -- Contoh: '2025/2026'
  `semester` enum('Ganjil', 'Genap') NOT NULL,
  `type` enum('Tugas', 'UH', 'UTS', 'UAS') NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 11. TABEL RIWAYAT AKADEMIK SISWA (ACADEMIC HISTORY / RAPOR)
-- ==========================================
CREATE TABLE `academic_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `semester` enum('Ganjil', 'Genap') NOT NULL,
  `behavior_score` int(11) DEFAULT 100,
  `present` int(11) DEFAULT 0,
  `absent` int(11) DEFAULT 0,
  `sick` int(11) DEFAULT 0,
  `permission` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 12. TABEL BIMBINGAN KONSELING (COUNSELING CASES / BK)
-- ==========================================
CREATE TABLE `bk_cases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `case_description` text NOT NULL,
  `severity` enum('Ringan', 'Sedang', 'Berat') NOT NULL DEFAULT 'Ringan',
  `follow_up` text,
  `status` enum('Selesai', 'Proses', 'Pemantauan') NOT NULL DEFAULT 'Proses',
  `logged_by` int(11) NOT NULL, -- ID Staff/Guru BK yang mencatat
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`logged_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 13. TABEL UJIAN CBT (CBT EXAMS)
-- ==========================================
CREATE TABLE `cbt_exams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `duration_minutes` int(11) NOT NULL DEFAULT 60,
  `status` enum('Draft', 'Aktif', 'Selesai') DEFAULT 'Draft',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 14. TABEL PERTANYAAN UJIAN CBT (CBT QUESTIONS)
-- ==========================================
CREATE TABLE `cbt_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `option_a` text NOT NULL,
  `option_b` text NOT NULL,
  `option_c` text NOT NULL,
  `option_d` text NOT NULL,
  `correct_option` enum('A', 'B', 'C', 'D') NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`exam_id`) REFERENCES `cbt_exams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 15. TABEL JAWABAN SISWA CBT (CBT SUBMISSIONS)
-- ==========================================
CREATE TABLE `cbt_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `submitted_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`exam_id`) REFERENCES `cbt_exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 16. TABEL SARANA PRASARANA (SARPRAS / INVENTARIS)
-- ==========================================
CREATE TABLE `sarpras` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(150) NOT NULL,
  `code` varchar(50) NOT NULL,
  `category` varchar(100) NOT NULL,
  `qty_baik` int(11) NOT NULL DEFAULT 0,
  `qty_rusak_ringan` int(11) NOT NULL DEFAULT 0,
  `qty_rusak_berat` int(11) NOT NULL DEFAULT 0,
  `room` varchar(100) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 17. TABEL PENGUMUMAN (ANNOUNCEMENTS)
-- ==========================================
CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `target_audience` varchar(50) NOT NULL DEFAULT 'semua', -- 'semua', 'guru', 'ortu', etc.
  `created_by` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 18. TABEL NOTIFIKASI (NOTIFICATIONS)
-- ==========================================
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info', 'warning', 'success') DEFAULT 'info',
  `is_read` boolean DEFAULT FALSE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 19. TABEL TAHUN AJARAN & SEMESTER (ACADEMIC TERMS)
-- ==========================================
CREATE TABLE `academic_terms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `year` varchar(20) NOT NULL, -- Contoh: '2025/2026'
  `semester` enum('Ganjil', 'Genap') NOT NULL,
  `is_active` boolean DEFAULT FALSE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 20. TABEL KINERJA STAF (STAFF TASKS)
-- ==========================================
CREATE TABLE `kinerja_staf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `task` text NOT NULL,
  `status` enum('Proses', 'Selesai') DEFAULT 'Proses',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 21. TABEL MATERI AJAR (CURRICULUM MATERIALS)
-- ==========================================
CREATE TABLE `materi_ajar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `file_name` varchar(255),
  `status` enum('Review', 'Terbit') DEFAULT 'Review',
  `date` date NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 22. TABEL OBJECTIVES MATERI (LEARNING TARGETS)
-- ==========================================
CREATE TABLE `materi_objectives` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `materi_id` int(11) NOT NULL,
  `objective` text NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`materi_id`) REFERENCES `materi_ajar`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 23. TABEL KALENDER AKADEMIK / AGENDA (ACADEMIC CALENDAR)
-- ==========================================
CREATE TABLE `agenda` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `event` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `color` varchar(100) DEFAULT 'bg-emerald-100 text-emerald-800',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 24. TABEL PENGATURAN / SETTINGS (KEY-VALUE STORE)
-- ==========================================
CREATE TABLE `key_value_store` (
  `k` varchar(255) NOT NULL,
  `v` longtext NOT NULL,
  PRIMARY KEY (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========================================================
-- SEED DATA (DATA AWAL & CONTOH UNTUK SISTEM)
-- ========================================================

-- Seed Users dengan Password Default Berbagai Role
-- Catatan: Password disamakan dengan username masing-masing demi kemudahan login
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Dumping data untuk tabel `academic_terms`
INSERT INTO `academic_terms` (`id`, `year`, `semester`, `is_active`) VALUES
(1, '2025/2026', 'Ganjil', 1),
(2, '2025/2026', 'Genap', 0);

-- Dumping data untuk tabel `agenda`
INSERT INTO `agenda` (`id`, `date`, `event`, `type`, `color`) VALUES
(1, '2026-07-15', 'Hari Pertama Masuk Sekolah', 'Umum', 'bg-emerald-100 text-emerald-800'),
(2, '2026-08-17', 'Upacara HUT RI', 'Libur Nasional', 'bg-red-100 text-red-800'),
(3, '2026-09-21', 'Penilaian Tengah Semester (PTS)', 'Ujian', 'bg-amber-100 text-amber-800');

-- Dumping data untuk tabel `announcements`
INSERT INTO `announcements` (`id`, `title`, `content`, `target_audience`, `created_by`, `created_at`) VALUES
(1, 'Rapat Awal Tahun Ajaran 2026/2027', 'Diberitahukan kepada seluruh ustadz/ustadzah bahwa rapat pembagian tugas akan dilaksanakan hari Sabtu ini jam 08:30 WIB.', 'guru', 1, '2026-07-31 10:14:20'),
(2, 'Libur Menyambut Tahun Baru Hijriah', 'Siswa-siswi diliburkan mulai tanggal 25 s.d 26 Muharram.', 'semua', 1, '2026-07-31 10:14:20');

-- Dumping data untuk tabel `cbt_exams`
INSERT INTO `cbt_exams` (`id`, `title`, `subject_name`, `class_name`, `duration_minutes`, `status`, `created_at`) VALUES
(1, 'Ujian Harian Aljabar Linear', 'Matematika', 'X MIPA 1', 60, 'Aktif', '2026-07-31 10:14:20');

-- Dumping data untuk tabel `cbt_questions`
INSERT INTO `cbt_questions` (`id`, `exam_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`) VALUES
(1, 1, 'Tentukan himpunan penyelesaian dari 2x + 5 = 15!', 'x = 3', 'x = 5', 'x = 10', 'x = 2', 'B'),
(2, 1, 'Jika f(x) = 3x - 1, maka f(4) adalah...', '11', '12', '13', '10', 'A');

-- Dumping data untuk tabel `classes`
INSERT INTO `classes` (`id`, `name`, `wali_kelas_id`) VALUES
(6, 'X IBNU SINA', 19),
(7, 'X IBNU FIRNAS', 20),
(8, 'X IBNU BATTANI', 22);

-- Dumping data untuk tabel `key_value_store`
INSERT INTO `key_value_store` (`k`, `v`) VALUES
('absenZuhur_13_01-08-2026', 'true'),
('absenZuhur_19_01-08-2026', 'true'),
('app_teaching_assignments', '[]'),
('attendance_X IBNU SINA_Bahasa Inggris', '{\"2026-08-01\":{\"4\":{\"status\":\"Alpa\"},\"5\":{\"status\":\"Alpa\"},\"6\":{\"status\":\"Alpa\"},\"7\":{\"status\":\"Alpa\"},\"8\":{\"status\":\"Alpa\"},\"9\":{\"status\":\"Alpa\"},\"10\":{\"status\":\"Alpa\"},\"11\":{\"status\":\"Alpa\"},\"12\":{\"status\":\"Alpa\"}}}'),
('attendance_X IBNU SINA_Presensi Wali Kelas', '{\"2026-07-31\":{\"4\":{\"status\":\"Hadir\"}},\"2026-08-01\":{\"4\":{\"status\":\"Hadir\"},\"5\":{\"status\":\"Hadir\"},\"6\":{\"status\":\"Hadir\"},\"7\":{\"status\":\"Hadir\"},\"8\":{\"status\":\"Hadir\"},\"9\":{\"status\":\"Hadir\"},\"10\":{\"status\":\"Hadir\"}},\"2026-08-03\":{\"4\":{\"status\":\"Hadir\",\"ket\":\"\"},\"5\":{\"status\":\"Hadir\",\"ket\":\"\"},\"6\":{\"status\":\"Hadir\",\"ket\":\"\"},\"7\":{\"status\":\"Hadir\",\"ket\":\"\"},\"8\":{\"status\":\"Hadir\",\"ket\":\"\"},\"9\":{\"status\":\"Hadir\",\"ket\":\"\"},\"10\":{\"status\":\"Hadir\",\"ket\":\"\"},\"11\":{\"status\":\"Hadir\",\"ket\":\"\"},\"12\":{\"status\":\"Hadir\",\"ket\":\"\"}}}'),
('attendance_X IBNU SINA_Tahfizh Al-Quran', '{\"2026-08-01\":{\"4\":{\"status\":\"Hadir\"},\"5\":{\"status\":\"Izin\"},\"6\":{\"status\":\"Hadir\"},\"7\":{\"status\":\"Hadir\"},\"8\":{\"status\":\"Hadir\"},\"9\":{\"status\":\"Hadir\"},\"10\":{\"status\":\"Hadir\"},\"11\":{\"status\":\"Hadir\"},\"12\":{\"status\":\"Hadir\"}}}'),
('bk_advokasi_data', '[]'),
('bk_cases_data', '[]'),
('bk_pengembangan_data', '[]'),
('bk_penyaluran_data', '[]'),
('bk_preventif_data', '[]'),
('bk_rekomendasi_sp', '[]'),
('cbt_banksoal_data', '[]'),
('cbt_exams_data', '[]'),
('grades_X IBNU SINA_Bahasa Inggris', '{\"4\":{\"uh1\":\"99\",\"uts\":\"99\",\"uas\":\"99\"},\"5\":{\"uh1\":\"99\",\"uts\":\"99\",\"uas\":\"99\"},\"6\":{\"uh1\":\"99\",\"uts\":\"99\",\"uas\":\"99\"},\"7\":{\"uh1\":\"99\",\"uts\":\"99\",\"uas\":\"99\"},\"8\":{\"uh1\":\"99\",\"uts\":\"99\",\"uas\":\"99\"},\"9\":{\"uh1\":\"99\",\"uts\":\"99\",\"uas\":\"99\"},\"10\":{\"uh1\":\"99\",\"uts\":\"99\",\"uas\":\"99\"},\"11\":{\"uh1\":\"99\",\"uts\":\"99\",\"uas\":\"99\"},\"12\":{\"uh1\":\"99\",\"uts\":\"99\",\"uas\":\"99\"}}'),
('grades_X IBNU SINA_Tahfizh Al-Quran', '{\"4\":{\"uh1\":\"90\"},\"5\":{\"uh1\":\"90\"},\"6\":{\"uh1\":\"98\"}}'),
('guru_subjects', '[]'),
('jurnals', '[{\"id\":\"1785575656147\",\"tanggal\":\"01-08-2026\",\"kelas\":\"X IBNU SINA\",\"mataPelajaran\":\"Bahasa Inggris\",\"materi\":\"Noun\",\"catatan\":\"\"}]'),
('kesiswaan_ekskul_data', '[]'),
('kesiswaan_pelanggaran_data', '[]'),
('limit_absen_siswa', '17:00'),
('limit_absen_zuhur', '13:00'),
('mockAcademicTerms', '[]'),
('mockAgenda', '[{\"id\":1785500407544.5623,\"date\":\"2026-01-01\",\"event\":\"Tahun Baru 2026 Masehi\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.29,\"date\":\"2026-02-18\",\"event\":\"Isra Mikraj Nabi Muhammad SAW\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.1355,\"date\":\"2026-03-03\",\"event\":\"Hari Suci Nyepi Tahun Baru Saka 1948\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.8796,\"date\":\"2026-03-20\",\"event\":\"Hari Raya Idul Fitri 1447 Hijriah\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.4683,\"date\":\"2026-03-21\",\"event\":\"Hari Raya Idul Fitri 1447 Hijriah\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.9292,\"date\":\"2026-04-03\",\"event\":\"Wafat Yesus Kristus\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.2717,\"date\":\"2026-05-01\",\"event\":\"Hari Buruh Internasional\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.8276,\"date\":\"2026-05-14\",\"event\":\"Kenaikan Yesus Kristus\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.9133,\"date\":\"2026-05-27\",\"event\":\"Hari Raya Idul Adha 1447 Hijriah\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.287,\"date\":\"2026-05-31\",\"event\":\"Hari Raya Waisak 2570 BE\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.6858,\"date\":\"2026-06-01\",\"event\":\"Hari Lahir Pancasila\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.8352,\"date\":\"2026-06-16\",\"event\":\"Tahun Baru Islam 1448 Hijriah\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.2056,\"date\":\"2026-08-17\",\"event\":\"Hari Kemerdekaan Republik Indonesia\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.28,\"date\":\"2026-08-26\",\"event\":\"Maulid Nabi Muhammad SAW\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.9248,\"date\":\"2026-12-25\",\"event\":\"Hari Raya Natal\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.4912,\"date\":\"2027-01-01\",\"event\":\"Tahun Baru 2027 Masehi\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.5051,\"date\":\"2027-02-07\",\"event\":\"Isra Mikraj Nabi Muhammad SAW\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.3938,\"date\":\"2027-03-09\",\"event\":\"Hari Raya Idul Fitri 1448 Hijriah\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.161,\"date\":\"2027-03-10\",\"event\":\"Hari Raya Idul Fitri 1448 Hijriah\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.2551,\"date\":\"2027-03-26\",\"event\":\"Wafat Yesus Kristus\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.574,\"date\":\"2027-05-01\",\"event\":\"Hari Buruh Internasional\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.7441,\"date\":\"2027-05-16\",\"event\":\"Hari Raya Idul Adha 1448 Hijriah\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.1868,\"date\":\"2027-06-01\",\"event\":\"Hari Lahir Pancasila\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.9102,\"date\":\"2027-06-06\",\"event\":\"Tahun Baru Islam 1449 Hijriah\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.4714,\"date\":\"2027-08-15\",\"event\":\"Maulid Nabi Muhammad SAW\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544,\"date\":\"2027-08-17\",\"event\":\"Hari Kemerdekaan Republik Indonesia\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"},{\"id\":1785500407544.1807,\"date\":\"2027-12-25\",\"event\":\"Hari Raya Natal\",\"type\":\"Libur Nasional\",\"color\":\"bg-red-100 text-red-800\"}]'),
('mockStudents', '[]'),
('school_lat_l', '0.419789'),
('school_lat_p', '0.419596'),
('school_lng_l', '101.418739'),
('school_lng_p', '101.419115'),
('school_radius_l', '15'),
('school_radius_p', '15'),
('selectedAcademicTermId', '1'),
('walas_cases_data', '[]');

-- Dumping data untuk tabel `leave_requests`
INSERT INTO `leave_requests` (`id`, `user_id`, `type`, `start_date`, `end_date`, `reason`, `status`, `created_at`) VALUES
(8, 19, 'sakit', '2026-08-03', '2026-08-04', 'Demam', 'approved', '2026-08-03 04:11:39');

-- Dumping data untuk tabel `sarpras`
INSERT INTO `sarpras` (`id`, `item_name`, `code`, `category`, `qty_baik`, `qty_rusak_ringan`, `qty_rusak_berat`, `room`, `created_at`) VALUES
(1, 'Proyektor Epson EB-X400', 'Eps-PJ-01', 'Elektronik', 1, 0, 0, 'Ruang Kelas X MIPA 1', '2026-07-31 10:14:20'),
(2, 'Kursi Belajar Kayu Jati', 'Krs-KW-12', 'Mebel', 36, 0, 0, 'Ruang Kelas X MIPA 1', '2026-07-31 10:14:20'),
(3, 'AC Panasonic 1.5 PK', 'AC-Pan-03', 'Elektronik', 0, 1, 0, 'Ruang Perpustakaan', '2026-07-31 10:14:20');

-- Dumping data untuk tabel `schedules`
INSERT INTO `schedules` (`id`, `class_name`, `subject_name`, `teacher_id`, `day`, `start_time`, `end_time`) VALUES
(5, 'X IBNU FIRNAS', 'Tahfizh Al-Quran', 21, 'Selasa', '07:15:00', '08:00:00'),
(6, 'X IBNU BATTANI', 'Ekonomi', 22, 'Rabu', '07:15:00', '08:00:00'),
(14, 'X IBNU SINA', 'Tahfizh Al-Quran', 19, 'Senin', '07:15:00', '08:00:00');

-- Dumping data untuk tabel `subjects`
INSERT INTO `subjects` (`id`, `code`, `name`, `category`, `weekly_hours`) VALUES
(1, 'MTK-01', 'Matematika', 'Wajib', 4),
(2, 'FIS-01', 'Fisika', 'Pilihan', 3),
(3, 'KIM-01', 'Kimia', 'Pilihan', 3),
(4, 'ARB-01', 'Bahasa Arab', 'Muatan Lokal', 2),
(5, 'TFZ-01', 'Tahfizh Al-Quran', 'Muatan Lokal', 4),
(6, 'FIQ-01', 'Fiqih', 'Wajib', 2),
(7, 'AKD-01', 'Akidah Akhlak', 'Wajib', 2),
(8, 'IND-01', 'Bahasa Indonesia', 'Wajib', 4),
(9, 'ENG-01', 'Bahasa Inggris', 'Wajib', 4),
(10, 'SJR-01', 'Sejarah', 'Wajib', 2),
(11, 'PJK-01', 'Pendidikan Jasmani', 'Wajib', 2),
(12, 'SNI-01', 'Seni Budaya', 'Muatan Lokal', 2),
(13, 'PKN-01', 'Pendidikan Kewarganegaraan', 'Wajib', 2),
(14, 'BIO-01', 'Biologi', 'Pilihan', 3),
(15, 'EKO-01', 'Ekonomi', 'Pilihan', 3),
(16, 'GEO-01', 'Geografi', 'Pilihan', 3),
(17, 'SOS-01', 'Sosiologi', 'Pilihan', 3),
(18, 'IKU-01', 'Ilmu Tafsir', 'Muatan Lokal', 2),
(19, 'HAD-01', 'Ilmu Hadits', 'Muatan Lokal', 2),
(20, 'SKD-01', 'Sejarah Kebudayaan Islam', 'Wajib', 2);

-- Dumping data untuk tabel `teaching_assignments`
INSERT INTO `teaching_assignments` (`id`, `teacher_id`, `subject_name`, `class_name`) VALUES
(12, 19, 'Tahfizh Al-Quran', 'X IBNU SINA');
-- Dumping data untuk tabel `students`
INSERT INTO `students` (`id`, `user_id`, `name`, `nis`, `class_name`, `gender`, `parent_id`, `behavior_score`, `created_at`) VALUES
(4, NULL, 'ABRIZAN HARITZ MORALISETYO', '1001', 'X IBNU SINA', 'L', NULL, 100, '2026-07-31 12:32:43'),
(5, NULL, 'AKIF MUHAMMAD DZAKIY', '1002', 'X IBNU SINA', 'L', NULL, 100, '2026-07-31 12:32:43'),
(6, NULL, 'ALDEN HAFIZUDDIN AZIZAN', '1003', 'X IBNU SINA', 'L', NULL, 100, '2026-07-31 12:32:43'),
(7, NULL, 'ATHIF ABDURRAHMAN', '1004', 'X IBNU SINA', 'L', NULL, 100, '2026-07-31 12:32:43'),
(8, NULL, 'DAFFA REZKY HABIBI', '1005', 'X IBNU SINA', 'L', NULL, 100, '2026-07-31 12:32:43'),
(9, NULL, 'FADHIL HADI ARRASYID', '1006', 'X IBNU SINA', 'L', NULL, 100, '2026-07-31 12:32:43'),
(10, NULL, 'FAIQ ANUGERAH', '1007', 'X IBNU SINA', 'L', NULL, 100, '2026-07-31 12:32:43'),
(11, NULL, 'FATIH MUHAMMAD ALFARIQ', '1008', 'X IBNU SINA', 'L', NULL, 100, '2026-07-31 12:32:44'),
(12, NULL, 'FAWWAZ AULIA ANMAR', '1009', 'X IBNU SINA', 'L', NULL, 100, '2026-07-31 12:32:44'),
(13, NULL, 'FUAD AL HUSAINI', '1010', 'X', 'L', NULL, 100, '2026-07-31 12:32:44'),
(14, NULL, 'GHAZI FADHIL HILMI', '1011', 'X', 'L', NULL, 100, '2026-07-31 12:32:44'),
(15, NULL, 'IRFAN FATURRIZKI', '1012', 'X', 'L', NULL, 100, '2026-07-31 12:32:44'),
(16, NULL, 'JEVAN DANISH DHAIFULLAH ', '1013', 'X', 'L', NULL, 100, '2026-07-31 12:32:44'),
(17, NULL, 'KHAIRUL ABDIL', '1014', 'X', 'L', NULL, 100, '2026-07-31 12:32:44'),
(18, NULL, 'M. ZAKI MUBARRAQ DANI', '1015', 'X', 'L', NULL, 100, '2026-07-31 12:32:44'),
(19, NULL, 'MOH. FADIL ALFARISI', '1016', 'X', 'L', NULL, 100, '2026-07-31 12:32:44'),
(20, NULL, 'MUHAMMAD AZKA FIRMANSYAH', '1017', 'X', 'L', NULL, 100, '2026-07-31 12:32:44'),
(21, NULL, 'MUHAMMAD SAID ALAMSYAH', '1018', 'X', 'L', NULL, 100, '2026-07-31 12:32:44'),
(22, NULL, 'MUHAMMAD SULTAN FAKHRI', '1019', 'X', 'L', NULL, 100, '2026-07-31 12:32:44'),
(23, NULL, 'MUHAMMAD YUSUF AL GHIFARI', '1020', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(24, NULL, 'NAUFAL DZAKI WIJAYA', '1021', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(25, NULL, 'QURZADHA ALFARIZI ADIANSYA', '1022', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(26, NULL, 'RAHID RAMADHAN JAS', '1023', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(27, NULL, 'SAHEL AIMAN SADAAD', '1024', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(28, NULL, 'WAFI ANRRI AKRAM', '1025', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(29, NULL, 'AFDAL HIDAYATUL RAHMAT', '1026', 'X IBNU FIRNAS', 'L', NULL, 100, '2026-07-31 12:32:45'),
(30, NULL, 'ADITYA DAFFA FATONI', '1027', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(31, NULL, 'AHMAD HANNAN ZAIDAN', '1028', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(32, NULL, 'ALIF KHALFANI AYDIN RAMADHAN', '1029', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(33, NULL, 'BARIQ ZABIR AHMADI', '1030', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(34, NULL, 'DARMA WANSYAH', '1031', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(35, NULL, 'DZAKWAN AFKARI', '1032', 'X', 'L', NULL, 100, '2026-07-31 12:32:45'),
(36, NULL, 'FADEL MUKHLISIN', '1033', 'X', 'L', NULL, 100, '2026-07-31 12:32:46'),
(37, NULL, 'FARIID AL HAFIIZH', '1034', 'X', 'L', NULL, 100, '2026-07-31 12:32:46'),
(38, NULL, 'FAUZAN KAMIL', '1035', 'X', 'L', NULL, 100, '2026-07-31 12:32:46'),
(39, NULL, 'FAZLI AZZAM', '1036', 'X', 'L', NULL, 100, '2026-07-31 12:32:46'),
(40, NULL, 'FUDHAIL IHSAN AYYASHI', '1037', 'X', 'L', NULL, 100, '2026-07-31 12:32:46'),
(41, NULL, 'M. ZIDAN ', '1038', 'X', 'L', NULL, 100, '2026-07-31 12:32:46'),
(42, NULL, 'HABRI GHASSANI ARDI', '1039', 'X', 'L', NULL, 100, '2026-07-31 12:32:46'),
(43, NULL, 'KHAIRIL ABDIL', '1040', 'X', 'L', NULL, 100, '2026-07-31 12:32:46'),
(44, NULL, 'IZZAN FARHAN AHMAD', '1041', 'X', 'L', NULL, 100, '2026-07-31 12:32:46'),
(45, NULL, 'KEEFA HAFIDZ IBADURRAHMAN', '1042', 'X', 'L', NULL, 100, '2026-07-31 12:32:46'),
(46, NULL, 'M. IRHAB NABIL', '1043', 'X', 'L', NULL, 100, '2026-07-31 12:32:46'),
(47, NULL, 'MOHAMMAD AZKA ', '1044', 'X', 'L', NULL, 100, '2026-07-31 12:32:47'),
(48, NULL, 'MUHAMMAD ABDURRAHMAN', '1045', 'X', 'L', NULL, 100, '2026-07-31 12:32:47'),
(49, NULL, 'MUHAMMAD FAHRI KAMIL', '1046', 'X', 'L', NULL, 100, '2026-07-31 12:32:47'),
(50, NULL, 'MUHAMMAD SOLIHIN', '1047', 'X', 'L', NULL, 100, '2026-07-31 12:32:47'),
(51, NULL, 'NAUFAL ARIIQ FADHLURROHMAN', '1048', 'X', 'L', NULL, 100, '2026-07-31 12:32:47'),
(52, NULL, 'NAUFAL DZAKWAN HANIF', '1049', 'X', 'L', NULL, 100, '2026-07-31 12:32:47'),
(53, NULL, 'RIFQI DWI SETIAWAN', '1050', 'X', 'L', NULL, 100, '2026-07-31 12:32:47'),
(54, NULL, 'RIZUKA SYAHRIZA AZHARI', '1051', 'X', 'L', NULL, 100, '2026-07-31 12:32:47'),
(55, NULL, 'ABID YUSRI ABQARY', '1052', 'X', 'L', NULL, 100, '2026-07-31 12:32:47'),
(56, NULL, 'AGUS NUR RAMADANI', '1053', 'X', 'L', NULL, 100, '2026-07-31 12:32:47'),
(57, NULL, 'AHDAL ALI HAJJ', '1054', 'X', 'L', NULL, 100, '2026-07-31 12:32:47'),
(58, NULL, 'AHMAD AGHA ZIKRI SITOMPUL', '1055', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(59, NULL, 'ALDEN HAFIZUDDIN AZIZAN', '1056', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(60, NULL, 'ATTALARIQ SYAH HENDRIAN', '1057', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(61, NULL, 'BYANTARA LUTHFI ARDANA', '1058', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(62, NULL, 'DAFFA FAYYAD ARROFI', '1059', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(63, NULL, 'FADHLI DZIL IKRAM', '1060', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(64, NULL, 'HAFIZ JABâ€™BAR MAULANA', '1061', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(65, NULL, 'IBNU KHAIRAN KETAREN', '1062', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(66, NULL, 'M. FAQIH HALIM', '1063', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(67, NULL, 'M. RAFFA NOVRIANZAH', '1064', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(68, NULL, 'M. SYAUQI FIRDAUS', '1065', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(69, NULL, 'MUHAMMAD AQIL ALFATH ELMAIS', '1066', 'X', 'L', NULL, 100, '2026-07-31 12:32:48'),
(70, NULL, 'MUHAMMAD FIKRI KHOIR', '1067', 'X', 'L', NULL, 100, '2026-07-31 12:32:49'),
(71, NULL, 'MUHAMMAD IBNU YUSUF', '1068', 'X', 'L', NULL, 100, '2026-07-31 12:32:49'),
(72, NULL, 'MUHAMMAD MUMTAZUL AZKA', '1069', 'X', 'L', NULL, 100, '2026-07-31 12:32:49'),
(73, NULL, 'NAUFAL KHOIRUL AZHHAR', '1070', 'X', 'L', NULL, 100, '2026-07-31 12:32:49'),
(74, NULL, 'NOUVAL ADITYA NUGRAHA ZALUKHU', '1071', 'X', 'L', NULL, 100, '2026-07-31 12:32:49'),
(75, NULL, 'RENO PANGESTU', '1072', 'X', 'L', NULL, 100, '2026-07-31 12:32:49'),
(76, NULL, 'RIZIQ FRIZIANSYAH', '1073', 'X', 'L', NULL, 100, '2026-07-31 12:32:49'),
(77, NULL, 'RIZKY AL FARIZ', '1074', 'X', 'L', NULL, 100, '2026-07-31 12:32:49'),
(78, NULL, 'SAYYID ALFATH FAEYZA', '1075', 'X', 'L', NULL, 100, '2026-07-31 12:32:49'),
(79, NULL, 'ADI ZAMRI RAHMAN', '1076', 'X IBNU BATTANI', 'L', NULL, 100, '2026-07-31 12:32:49'),
(80, NULL, 'AHMAD ABID', '1077', 'X', 'L', NULL, 100, '2026-07-31 12:32:49'),
(81, NULL, 'AHMAD ZAKKI AL-MUFLIH', '1078', 'X', 'L', NULL, 100, '2026-07-31 12:32:50'),
(82, NULL, 'AL FIRASH FAYYAD AZROM', '1079', 'X', 'L', NULL, 100, '2026-07-31 12:32:50'),
(83, NULL, 'ALKINDI ANOURI', '1080', 'X', 'L', NULL, 100, '2026-07-31 12:32:50'),
(84, NULL, 'DZAKWAN AL-HAZEM DINATA', '1081', 'X', 'L', NULL, 100, '2026-07-31 12:32:50'),
(85, NULL, 'FAIZAN HABBIB ALMUZAKKI', '1082', 'X', 'L', NULL, 100, '2026-07-31 12:32:50'),
(86, NULL, 'IHSAN  HABIB', '1083', 'X', 'L', NULL, 100, '2026-07-31 12:32:50'),
(87, NULL, 'M. DZAKI BUKHAIRIL MA\'ARIF', '1084', 'X', 'L', NULL, 100, '2026-07-31 12:32:50'),
(88, NULL, 'M. FAKHRI RIFANI', '1085', 'X', 'L', NULL, 100, '2026-07-31 12:32:50'),
(89, NULL, 'M. RISKI HAFIZI', '1086', 'X', 'L', NULL, 100, '2026-07-31 12:32:50'),
(90, NULL, 'MUHAMMAD ARIL', '1087', 'X', 'L', NULL, 100, '2026-07-31 12:32:50'),
(91, NULL, 'MUHAMMAD FAHISH AL FAYYEDH', '1088', 'X', 'L', NULL, 100, '2026-07-31 12:32:51'),
(92, NULL, 'MUHAMMAD FAUZAN AZIMA', '1089', 'X', 'L', NULL, 100, '2026-07-31 12:32:51'),
(93, NULL, 'MUHAMMAD SYEHAN SYARIF AFDISA', '1090', 'X', 'L', NULL, 100, '2026-07-31 12:32:52'),
(94, NULL, 'NAUFAL UTHMAN', '1091', 'X', 'L', NULL, 100, '2026-07-31 12:32:52'),
(95, NULL, 'RAFA ATHALLAH ARDIANO', '1092', 'X', 'L', NULL, 100, '2026-07-31 12:32:53'),
(96, NULL, 'RAYHAN AZRA RAMADANI', '1093', 'X', 'L', NULL, 100, '2026-07-31 12:32:53'),
(97, NULL, 'RIDHO  PAHLEVI', '1094', 'X', 'L', NULL, 100, '2026-07-31 12:32:54'),
(98, NULL, 'RIENDHI ALFARD DWI PIDAN', '1095', 'X', 'L', NULL, 100, '2026-07-31 12:32:54'),
(100, NULL, 'ABDURRAHMAN AZIZI', '1096', 'X', 'L', NULL, 100, '2026-07-31 12:33:21'),
(101, NULL, 'AFFAN HABIBURROHMAN ', '1097', 'X', 'L', NULL, 100, '2026-07-31 12:33:21'),
(102, NULL, 'AFIF WALDAN', '1098', 'X', 'L', NULL, 100, '2026-07-31 12:33:21'),
(103, NULL, 'ALBAR HERSA PRATAMA', '1099', 'X', 'L', NULL, 100, '2026-07-31 12:33:21'),
(104, NULL, 'ALHAFIZI HERMAWAN', '1100', 'X', 'L', NULL, 100, '2026-07-31 12:33:22'),
(105, NULL, 'ALKHENDRI', '1101', 'X', 'L', NULL, 100, '2026-07-31 12:33:22'),
(106, NULL, 'AMRU SOFIAN TANJUNG', '1102', 'X', 'L', NULL, 100, '2026-07-31 12:33:22'),
(107, NULL, 'FAHRI RIZKI RAMADHAN', '1103', 'X', 'L', NULL, 100, '2026-07-31 12:33:22'),
(108, NULL, 'IKRAR RIDA PAHLAWAN', '1104', 'X', 'L', NULL, 100, '2026-07-31 12:33:22'),
(109, NULL, 'M. FADHIL ARRAFY', '1105', 'X', 'L', NULL, 100, '2026-07-31 12:33:22'),
(110, NULL, 'M. HABIBUR ROHMAN ', '1106', 'X', 'L', NULL, 100, '2026-07-31 12:33:23'),
(111, NULL, 'MUHAMMAD ABDULLAH IHSAN JAMIL', '1107', 'X', 'L', NULL, 100, '2026-07-31 12:33:23'),
(112, NULL, 'MUHAMMAD ADIB ADINATA', '1108', 'X', 'L', NULL, 100, '2026-07-31 12:33:23'),
(113, NULL, 'MUHAMMAD AMRULLAH ', '1109', 'X', 'L', NULL, 100, '2026-07-31 12:33:23'),
(114, NULL, 'MUHAMMAD ASSADIL AZAM', '1110', 'X', 'L', NULL, 100, '2026-07-31 12:33:24'),
(115, NULL, 'MUHAMMAD FAUZAN AZIMA', '1111', 'X', 'L', NULL, 100, '2026-07-31 12:33:24'),
(116, NULL, 'MUHAMMAD FAYYADH AFIFUDDIN', '1112', 'X', 'L', NULL, 100, '2026-07-31 12:33:24'),
(117, NULL, 'MUHAMMAD HAMDANI', '1113', 'X', 'L', NULL, 100, '2026-07-31 12:33:24'),
(118, NULL, 'PASHA RAMADHAN', '1114', 'X', 'L', NULL, 100, '2026-07-31 12:33:24'),
(119, NULL, 'RAFA RADITYA', '1115', 'X', 'L', NULL, 100, '2026-07-31 12:33:24'),
(120, NULL, 'RAGHID ARYA SATYA PUTRA', '1116', 'X', 'L', NULL, 100, '2026-07-31 12:33:24'),
(121, NULL, 'RIFQI DWI SETIAWAN', '1117', 'X', 'L', NULL, 100, '2026-07-31 12:33:24'),
(122, NULL, 'SYAHMUDA PARHIMPUNAN HSB', '1118', 'X', 'L', NULL, 100, '2026-07-31 12:33:25'),
(123, NULL, 'SYAUQI EL PAMILY', '1119', 'X', 'L', NULL, 100, '2026-07-31 12:33:25'),
(124, NULL, 'ADIVA MARTHA NASUTION', '1120', 'X', 'P', NULL, 100, '2026-07-31 12:33:25'),
(125, NULL, 'ALFIRA ZAHWA', '1121', 'X', 'P', NULL, 100, '2026-07-31 12:33:25'),
(126, NULL, 'ANGGI RATUNANSYAH RITONGA', '1122', 'X', 'P', NULL, 100, '2026-07-31 12:33:25'),
(127, NULL, 'ANISA AHMAT', '1123', 'X', 'P', NULL, 100, '2026-07-31 12:33:25'),
(128, NULL, 'AQILA NADHIFAH', '1124', 'X', 'P', NULL, 100, '2026-07-31 12:33:25'),
(129, NULL, 'ENCIK ZHAFIRA LUQYANA HANI', '1125', 'X', 'P', NULL, 100, '2026-07-31 12:33:25'),
(130, NULL, 'FEBY AULIA SIREGAR', '1126', 'X', 'P', NULL, 100, '2026-07-31 12:33:26'),
(131, NULL, 'GHAZYA NAZIRA KHANSA', '1127', 'X', 'P', NULL, 100, '2026-07-31 12:33:26'),
(132, NULL, 'HANIFAH MEIDIANTY', '1128', 'X', 'P', NULL, 100, '2026-07-31 12:33:26'),
(133, NULL, 'LUTHFIAH NAFI\'AH', '1129', 'X', 'P', NULL, 100, '2026-07-31 12:33:26'),
(134, NULL, 'MEIZYA KURNIA CANMEILLA', '1130', 'X', 'P', NULL, 100, '2026-07-31 12:33:26'),
(135, NULL, 'NAILA NAFIA AFIFA', '1131', 'X', 'P', NULL, 100, '2026-07-31 12:33:26'),
(136, NULL, 'NAVEEN SHAHRAZAD NADILLA', '1132', 'X', 'P', NULL, 100, '2026-07-31 12:33:26'),
(137, NULL, 'NAZHIFA HAFSHA', '1133', 'X', 'P', NULL, 100, '2026-07-31 12:33:26'),
(138, NULL, 'NAZWA ZAHIRA SHOFA', '1134', 'X', 'P', NULL, 100, '2026-07-31 12:33:27'),
(139, NULL, 'NUR MALIKA NAFISA ', '1135', 'X', 'P', NULL, 100, '2026-07-31 12:33:27'),
(140, NULL, 'NURUL ATIQAH ZAHRAH', '1136', 'X', 'P', NULL, 100, '2026-07-31 12:33:27'),
(141, NULL, 'OLIVIA NATASYA PRAMUDITA', '1137', 'X', 'P', NULL, 100, '2026-07-31 12:33:27'),
(142, NULL, 'RADHIYYA PUTRI PRATAMA', '1138', 'X', 'P', NULL, 100, '2026-07-31 12:33:27'),
(143, NULL, 'SALSABILA RAISSA OLIVIA INDIRA HASIBUAN', '1139', 'X', 'P', NULL, 100, '2026-07-31 12:33:27'),
(144, NULL, 'SHAFIYAH AL-KARIMAH DAULAY', '1140', 'X', 'P', NULL, 100, '2026-07-31 12:33:27'),
(145, NULL, 'VIKA PUSPITA SARY', '1141', 'X', 'P', NULL, 100, '2026-07-31 12:33:27'),
(146, NULL, 'ZAKIA ZAHRATU NISA', '1142', 'X', 'P', NULL, 100, '2026-07-31 12:33:28'),
(147, NULL, 'AISYA RAMADHANI', '1143', 'X', 'P', NULL, 100, '2026-07-31 12:33:28'),
(148, NULL, 'ALIYAH IZZATUNISA', '1144', 'X', 'P', NULL, 100, '2026-07-31 12:33:28'),
(149, NULL, 'ANDI SALSHABILA ARKANURIA BAHAR', '1145', 'X', 'P', NULL, 100, '2026-07-31 12:33:28'),
(150, NULL, 'ANGRAINI RISMAYANI', '1146', 'X', 'P', NULL, 100, '2026-07-31 12:33:28'),
(151, NULL, 'ANNISAH PUTRI FAHIRA', '1147', 'X', 'P', NULL, 100, '2026-07-31 12:33:28'),
(152, NULL, 'ATIFA ZAHRA PUTRI YATRA', '1148', 'X', 'P', NULL, 100, '2026-07-31 12:33:28'),
(153, NULL, 'DINDA PUTRI JELITA', '1149', 'X', 'P', NULL, 100, '2026-07-31 12:33:28'),
(154, NULL, 'FAIZA GHINA ARRIFA', '1150', 'X', 'P', NULL, 100, '2026-07-31 12:33:28'),
(155, NULL, 'HAFIZDA AZZAHRA', '1151', 'X', 'P', NULL, 100, '2026-07-31 12:33:28'),
(156, NULL, 'HIFZIATUL HAKIMAH', '1152', 'X', 'P', NULL, 100, '2026-07-31 12:33:29'),
(157, NULL, 'KEISHA FRIZKYLA ANINDA ', '1153', 'X', 'P', NULL, 100, '2026-07-31 12:33:29'),
(158, NULL, 'LARASITHA PUTRI FAADILAH', '1154', 'X', 'P', NULL, 100, '2026-07-31 12:33:29'),
(159, NULL, 'NAIFA WALIDINA', '1155', 'X', 'P', NULL, 100, '2026-07-31 12:33:29'),
(160, NULL, 'NAYRA NAFISA', '1156', 'X', 'P', NULL, 100, '2026-07-31 12:33:29'),
(161, NULL, 'NAZHIRA FIRSTA OTRI', '1157', 'X', 'P', NULL, 100, '2026-07-31 12:33:29'),
(162, NULL, 'NUR HUSNA KAMILAH', '1158', 'X', 'P', NULL, 100, '2026-07-31 12:33:29'),
(163, NULL, 'NUR UFAIRA', '1159', 'X', 'P', NULL, 100, '2026-07-31 12:33:29'),
(164, NULL, 'NURUL KHAIRIN', '1160', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(165, NULL, 'QUEEN LATHIFAH', '1161', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(166, NULL, 'RAISA MUNIRA NAHDA', '1162', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(167, NULL, 'SALWA WIDI SYAHPUTRI', '1163', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(168, NULL, 'SRI HUSWATUN MUNAHWAROH ', '1164', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(169, NULL, 'ZAHIRA QOLBINA', '1165', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(170, NULL, 'ANDI ZALIKA QUINZA SYAFIAH', '1166', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(171, NULL, 'AISYAH PRATAMA HARIADI', '1167', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(172, NULL, 'ALISAHA ALFANI ', '1168', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(173, NULL, 'AMIRAH', '1169', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(174, NULL, 'ANNISA JAZILA RAHMA', '1170', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(175, NULL, 'ASYLA HUMAIRA YANUR', '1171', 'X', 'P', NULL, 100, '2026-07-31 12:33:30'),
(176, NULL, 'CINTA AULIA ENARA', '1172', 'X', 'P', NULL, 100, '2026-07-31 12:33:31'),
(177, NULL, 'DINI SUGESTI', '1173', 'X', 'P', NULL, 100, '2026-07-31 12:33:31'),
(178, NULL, 'DZAFIRA ATHIFAH', '1174', 'X', 'P', NULL, 100, '2026-07-31 12:33:31'),
(179, NULL, 'HAFIZAH', '1175', 'X', 'P', NULL, 100, '2026-07-31 12:33:31'),
(180, NULL, 'JANETA SALSABILA ARIFIN', '1176', 'X', 'P', NULL, 100, '2026-07-31 12:33:31'),
(181, NULL, 'KHANZA PURNAMA MAHEN', '1177', 'X', 'P', NULL, 100, '2026-07-31 12:33:31'),
(182, NULL, 'KYANE ARTHA FEBIOLA', '1178', 'X', 'P', NULL, 100, '2026-07-31 12:33:31'),
(183, NULL, 'NABILAH QURRATUL AIN', '1179', 'X', 'P', NULL, 100, '2026-07-31 12:33:31'),
(184, NULL, 'NAJLA ZHAFIRA RAMADHINA REVA', '1180', 'X', 'P', NULL, 100, '2026-07-31 12:33:31'),
(185, NULL, 'NAURA FATIHA FAHRANI', '1181', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(186, NULL, 'NAYLA AFIFAH ', '1182', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(187, NULL, 'NOFA PRIANI SARTIKA ', '1183', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(188, NULL, 'NURUL AFIFAH AZZAHRA', '1184', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(189, NULL, 'NURUL HIKMAH', '1185', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(190, NULL, 'RIRI AMELIA', '1186', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(191, NULL, 'SIREN ROHAN', '1187', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(192, NULL, 'SYARIFAH GHEFIRA AISKA', '1188', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(193, NULL, 'VANIA SALSABIL', '1189', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(194, NULL, 'WAFA  ATHIYAH  FISKA', '1190', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(195, NULL, 'ZAHYRAH ATTIFAH', '1191', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(196, NULL, 'ZHIVANA ALMIRA DISYA', '1192', 'X', 'P', NULL, 100, '2026-07-31 12:33:32'),
(197, NULL, 'ATHIYAH TSAMINAH', '1193', 'X', 'P', NULL, 100, '2026-07-31 12:33:33'),
(198, NULL, 'ALYA PUTRI MADURI', '1194', 'X', 'P', NULL, 100, '2026-07-31 12:33:33'),
(199, NULL, 'ASYFA NURHASANAH', '1195', 'X', 'P', NULL, 100, '2026-07-31 12:33:33'),
(200, NULL, 'ADZRA ZAHIRAH ', '1196', 'X', 'P', NULL, 100, '2026-07-31 12:33:33'),
(201, NULL, 'CLARA ANDITHA PUTRI', '1197', 'X', 'P', NULL, 100, '2026-07-31 12:33:33'),
(202, NULL, 'FARWAH HANIYYA MUALLIM', '1198', 'X', 'P', NULL, 100, '2026-07-31 12:33:33'),
(203, NULL, 'HAMIDAH MUIZZATUS SU\'ADA', '1199', 'X', 'P', NULL, 100, '2026-07-31 12:33:33'),
(204, NULL, 'HASNA AMIRAH', '1200', 'X', 'P', NULL, 100, '2026-07-31 12:33:33'),
(205, NULL, 'HAYATUNNUFUS', '1201', 'X', 'P', NULL, 100, '2026-07-31 12:33:33'),
(206, NULL, 'IZMI PUTRI DWIYANA', '1202', 'X', 'P', NULL, 100, '2026-07-31 12:33:33'),
(207, NULL, 'NUR AISYAH', '1203', 'X', 'P', NULL, 100, '2026-07-31 12:33:33'),
(208, NULL, 'SARA AZAHRA RUSTI', '1204', 'X', 'P', NULL, 100, '2026-07-31 12:33:34'),
(209, NULL, 'HAFIDZAH AZ- ZAHRA  KHAIRUNNISA', '1205', 'X', 'P', NULL, 100, '2026-07-31 12:33:34'),
(210, NULL, 'SOFIYAH', '1206', 'X', 'P', NULL, 100, '2026-07-31 12:33:34'),
(211, NULL, 'SALWA  FADHILATUSSYIFAA', '1207', 'X', 'P', NULL, 100, '2026-07-31 12:33:34');
-- Dumping data untuk tabel `users`
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `roles`, `nuptk`, `gender`, `avatar`, `class_name`, `child_id`, `created_at`) VALUES
(1, 'admin', 'admin', 'Administrator MA IBS', 'admin', '[\"admin\"]', '1234567890', 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Administrator%20MA%20IBS', NULL, NULL, '2026-07-31 10:14:20'),
(12, 'misran', '$2b$10$15wecNmXqIvJPn98WWCSMeDiGAZCnlHiBsPqrKKHF54alPrZatfdu', 'Misran, SE.Sy', 'kamad', '[\"kamad\",\"admin\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Misran%2C%20SE.Sy', NULL, NULL, '2026-07-31 11:00:57'),
(13, 'dodi', '$2b$10$Mz6v070bfXH..f2OYx.2D.49Q6NcOomgeTxbAafs73999EdGsCkh.', 'Dodi Oktarisa, Lc, Gr', 'wakakurikulum', '[\"wakakurikulum\",\"guru\",\"admin\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dodi%20Oktarisa%2C%20Lc%2C%20Gr', NULL, NULL, '2026-07-31 11:00:57'),
(14, 'adey', '$2b$10$ncxPWxabtQ8dXt3WbUlQAePT49x5nhra1ttvjtax0BAw1tC44sK0e', 'Adey Anuggrah, M.Pd', 'wakakesiswaan', '[\"wakakesiswaan\",\"guru\",\"admin\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adey%20Anuggrah%2C%20M.Pd', NULL, NULL, '2026-07-31 11:00:57'),
(15, 'dwi', '$2b$10$QaE3m1UOsgjwaf99KYt5RuxBtOvNuEOQK3K3rQauF6GGWWjwgUmiy', 'Dwi Nur Faratiwi, S.Pd', 'wakakesiswaan', '[\"wakakesiswaan\",\"guru\",\"admin\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dwi%20Nur%20Faratiwi%2C%20S.Pd', NULL, NULL, '2026-07-31 11:00:57'),
(16, 'dasdi', '$2b$10$CpGa5w/zDYpnHAT.kOlxieD5z4Rn27CflbZTLxN.NRWmJ6EQyGSbK', 'Dasdi Hastuti, A.Md', 'admin', '[\"admin\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dasdi%20Hastuti%2C%20A.Md', NULL, NULL, '2026-07-31 11:00:57'),
(17, 'mulizen', '$2b$10$6iq9IJHZy0cUm9QBOAcfGun/m5cd.eV2SPyXBZ.BOgIdbkV8Py7cm', 'Mulizen, S.Pd', 'admin', '[\"admin\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mulizen%2C%20S.Pd', NULL, NULL, '2026-07-31 11:00:57'),
(18, 'fitrizal', '$2b$10$rhsv2akhvTl.iap70SR6T.slwiZKh41UFNBsgj/eOTAAkrCZNiPle', 'Fitrizal, ST', 'admin', '[\"admin\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fitrizal%2C%20ST', NULL, NULL, '2026-07-31 11:00:57'),
(19, 'andre', '$2b$10$C3Di7.ap/wiOe4bYVhtO1.SOFjfFgjJoyXpPeBV6mMpEq175Qq/fG', 'Andre  Wahyudi, S.Pd', 'walas', '[\"walas\",\"guru_quran\"]', '0135467', 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andre%20%20Wahyudi%2C%20S.Pd', 'X IBNU SINA', NULL, '2026-07-31 11:00:57'),
(20, 'adey1', '$2b$10$sBwNpIuHyGIFNHNjHKTdfu17XMK1tvpYAi02nedzQUMayHdE5Nlc2', 'Adey Fajri Dwi Putra, S.Psi', 'walas', '[\"walas\",\"guru\",\"bk\"]', '123456789', 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adey%20Fajri%20Dwi%20Putra%2C%20S.Psi', 'X IBNU FIRNAS', NULL, '2026-07-31 11:00:58'),
(21, 'muhammad', '$2b$10$PSVdhIf6vraYWrcsAloete9w41e6dNCEmaaTtjwliaouWO/Mb08pi', 'Muhammad Rudini, S.Pd', 'walas', '[\"walas\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Muhammad%20Rudini%2C%20S.Pd', NULL, NULL, '2026-07-31 11:00:58'),
(22, 'suyani', '$2b$10$J1KyTdoD.8FvzHdzjZpaZ.K.R7Qthxz.RkX6mb8bg8akmKit69FJG', 'Suyani, S.Pd', 'walas', '[\"walas\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suyani%2C%20S.Pd', 'X IBNU BATTANI', NULL, '2026-07-31 11:00:58'),
(23, 'kholilullah', '$2b$10$lxP1EsXJDBD14oyyDXmjK.9mz/E/0Yx1dqOlwqzLz2cFkvkQ2aB26', 'Kholilullah Al-hafizh', 'walas', '[\"walas\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kholilullah%20Al-hafizh', NULL, NULL, '2026-07-31 11:00:58'),
(24, 'muhammad1', '$2b$10$eUUhy.kIHj12pnr.Nip4QuL5h9IO5b/EvrYzn/p2MmvzQIQ3S4.EG', 'Muhammad Al Firman, ME', 'walas', '[\"walas\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Muhammad%20Al%20Firman%2C%20ME', NULL, NULL, '2026-07-31 11:00:58'),
(25, 'ali', '$2b$10$Z/jZlUXfTHAkH4JPCLufQ.N/CjijEWhnjqpclt1IfOTNbS9ZHg1yq', 'Ali Ridho, S.Pd', 'walas', '[\"walas\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali%20Ridho%2C%20S.Pd', NULL, NULL, '2026-07-31 11:00:58'),
(26, 'rizki', '$2b$10$PndAgO0Y5qDFy4G9Veebr.MtompqSrwlJ7h08TlKj0DfGnNa4DFRS', 'Rizki Kurniawan, M.Pd', 'walas', '[\"walas\",\"bk\"]', '12345', 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rizki%20Kurniawan%2C%20M.Pd', '', NULL, '2026-07-31 11:00:58'),
(27, 'muhammad2', '$2b$10$Eg7JhNPq8b/7TJRFt6LDxeaI5/KzsrzkHs8C0iTwWMESKKKIkX0Fe', 'Muhammad Azwam,S.Pd', 'walas', '[\"walas\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Muhammad%20Azwam%2CS.Pd', NULL, NULL, '2026-07-31 11:00:58'),
(28, 'andi', '$2b$10$WqnXNnAO.3apPjMdMYQu5u71lgCuqN9qBkRwysKcDyf8tzWs61GlO', 'Andi Sahputra, M.Pd', 'walas', '[\"walas\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi%20Sahputra%2C%20M.Pd', NULL, NULL, '2026-07-31 11:00:58'),
(29, 'ainun', '$2b$10$BbbJKqWnG1qV3wL6afUMuexT3E9hZXUpq9ycuxf1s.W825AYWZMR2', 'Ainun Na\'im, Lc', 'walas', '[\"walas\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ainun%20Na\'im%2C%20Lc', NULL, NULL, '2026-07-31 11:00:58'),
(30, 'fahrul', '$2b$10$jym.49V/WSiJONRmobgb2eZF6/lMm7ZC5qlrLtMS9bbrBL7mQVh3S', 'Fahrul Rozi, Lc, MH', 'walas', '[\"walas\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fahrul%20Rozi%2C%20Lc%2C%20MH', NULL, NULL, '2026-07-31 11:00:58'),
(31, 'pujiono', '$2b$10$1Fd/4olcyc7x5jbmtET2f.W.xgGO33n5QaZoIuktQV1q6YUEPNfkm', 'Pujiono, S.Pd', 'walas', '[\"walas\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pujiono%2C%20S.Pd', NULL, NULL, '2026-07-31 11:00:58'),
(32, 'herman', '$2b$10$JlUp/OZi3VKDyQzIFAi2yOnyAqxeLB.q2QepXVVUHvj3tlW1I8QYy', 'Herman Alfarizi, S.Ud, MH', 'guru_quran', '[\"guru_quran\",\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Herman%20Alfarizi%2C%20S.Ud%2C%20MH', NULL, NULL, '2026-07-31 11:00:58'),
(33, 'nurman', '$2b$10$un3GGgFGJoTJz8IueeD/EOjaE/1/aTWPybf5EpcL6Il4XD1za0cnm', 'Nurman Sattar, Se', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nurman%20Sattar%2C%20Se', NULL, NULL, '2026-07-31 11:00:59'),
(34, 'delvian', '$2b$10$aaXLxaCyfKvea/pTjjacHefWCH/XmuZQYYxF3ct1hbPoc/WvO2EsW', 'Delvian Ariyanto, S.Pd', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Delvian%20Ariyanto%2C%20S.Pd', NULL, NULL, '2026-07-31 11:00:59'),
(35, 'winda', '$2b$10$H6.l0aoWcxdQbmVUT9ly1OK3OG8jQV.F3VSpOAnV8AzQInGN0KDvS', 'Winda Wijayani, S.Pd', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Winda%20Wijayani%2C%20S.Pd', NULL, NULL, '2026-07-31 11:00:59'),
(36, 'defi', '$2b$10$aF6vTpZb1VrEBE6/YTjGbuzUx57f2qfGud7j2/ELo.D/R7xtWPG/S', 'Defi Andriani, S.Psi', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Defi%20Andriani%2C%20S.Psi', NULL, NULL, '2026-07-31 11:00:59'),
(37, 'nurainun', '$2b$10$cG4AE9ldFs7ifyUJOmUWp.y4l0qLutT7Sxi0c7gte761BwySFYAnW', 'Nurainun Ritonga, M. Pd', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nurainun%20Ritonga%2C%20M.%20Pd', NULL, NULL, '2026-07-31 11:00:59'),
(38, 'rohani', '$2b$10$S9qBrbU2HfrqGrWZBIIQUeNkx8hVtEQG9uigWpQ5TdNLxfgIpdIQa', 'Rohani Al-Hafizhah', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohani%20Al-Hafizhah', NULL, NULL, '2026-07-31 11:00:59'),
(39, 'norly', '$2b$10$AKWreTlUJqM63JaxSD9jBOSMnSh4A.pKZ1Q3zXXkDcKD7hArDN2FG', 'Norly Ardianti Sarafina, S.I.Q., S.Ag', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Norly%20Ardianti%20Sarafina%2C%20S.I.Q.%2C%20S.Ag', NULL, NULL, '2026-07-31 11:00:59'),
(40, 'annisa', '$2b$10$nyyUFXUC5eQhnkaNPKtUYOO/LQWZkIJ5hMA4Uaws8mwb5hIMXhzR.', 'Annisa Salsabila Rizfi, S.Pd', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Annisa%20Salsabila%20Rizfi%2C%20S.Pd', NULL, NULL, '2026-07-31 11:00:59'),
(41, 'sartika', '$2b$10$Zm2UOExcjjkx1QIRLJjCP.pUOVUu7EEx.Zdbf1MJkUqKg3RW.VkfK', 'Sartika Wahyu Ilham, S.Pd.I', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sartika%20Wahyu%20Ilham%2C%20S.Pd.I', NULL, NULL, '2026-07-31 11:00:59'),
(42, 'sartika1', '$2b$10$VVxNqKrjR4NSwb7hhBHgxe.q4rwxniu6t.SVLuf4BI2r9Yb1Ef0qm', 'Sartika, S.Pd', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sartika%2C%20S.Pd', NULL, NULL, '2026-07-31 11:00:59'),
(43, 'roza', '$2b$10$gjmQklGXjZeePGIowHa2TO2iHoqdlWCPd0cfwZTlfLE248dj8gxRO', 'Roza Yulita, S.Si, M.Si', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roza%20Yulita%2C%20S.Si%2C%20M.Si', NULL, NULL, '2026-07-31 11:00:59'),
(44, 'mawaddaturrohmah', '$2b$10$.eq53DUC8A759s4.fRYjdeFL4zVQQsk3DyZ1HbD2aQpnN67lRp74.', 'Mawaddaturrohmah, S.Pd, M.Si', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mawaddaturrohmah%2C%20S.Pd%2C%20M.Si', NULL, NULL, '2026-07-31 11:00:59'),
(45, 'rahmi', '$2b$10$cDupmKLrY10eZxs3mjDGL.fvSnU3x90yDDTXoXZoDsLLOk7DzCtI2', 'Rahmi Padilah Nasution, S.Ag', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahmi%20Padilah%20Nasution%2C%20S.Ag', NULL, NULL, '2026-07-31 11:01:00'),
(46, 'ratna', '$2b$10$T9/GF5Mj3sSTdhc4HA2cq./dHVlnRQ0ds8UEgb5P4epmw9H7M1CDC', 'Ratna Mutu Anugrah, M.Pd', 'walas', '[\"walas\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ratna%20Mutu%20Anugrah%2C%20M.Pd', NULL, NULL, '2026-07-31 11:01:00'),
(47, 'nurul', '$2b$10$eMzrf4mIvwXoVq9WrbtZLuwzJXshsI.M0vc.vpCeX14ibmirTtxBy', 'Nurul Hudaina, S.Pd', 'guru_quran', '[\"guru_quran\",\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nurul%20Hudaina%2C%20S.Pd', NULL, NULL, '2026-07-31 11:01:00'),
(48, 'eka', '$2b$10$UF8Ibtxe4nlcfzCwAwIFZ.z6SQTxfqt1jCImSgh8I88KB/eCz.af2', 'Eka Yudiasti, Lc', 'guru', '[\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eka%20Yudiasti%2C%20Lc', NULL, NULL, '2026-07-31 11:01:00'),
(49, 'istiharoh', '$2b$10$KozZCFztwOc/LIZMmUfAvO0Wskp.bVR18tg9gecUdFUUhSxfRjaJC', 'Istiharoh, S.Pd', 'guru', '[\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Istiharoh%2C%20S.Pd', NULL, NULL, '2026-07-31 11:01:00'),
(50, 'uswatun', '$2b$10$OEnpePl8ifX/yifcDoKPSu3rfpUBlSjnS24zE/PxS9stk3NW4n0nK', 'Uswatun Hasanah, S.Pd, Gr', 'guru', '[\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Uswatun%20Hasanah%2C%20S.Pd%2C%20Gr', NULL, NULL, '2026-07-31 11:01:00'),
(51, 'nur', '$2b$10$tQSxwPATRiA8P/PJjnmmnOIhvzOKScnPoDRCitGJH44KqmYZ8G6U6', 'Nur Annisah, S.Ag', 'guru', '[\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nur%20Annisah%2C%20S.Ag', NULL, NULL, '2026-07-31 11:01:00'),
(52, 'fadilah', '$2b$10$vtFCE6YQshiZQN1/u0rjZOHvRVn03vCfuyZyNA6c0Pre/uuookjFi', 'Fadilah Sari, S.Si', 'guru', '[\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fadilah%20Sari%2C%20S.Si', NULL, NULL, '2026-07-31 11:01:00'),
(53, 'fauzi', '$2b$10$Z1fzQtp66UeIOOip0HqciejJnLKLF3aTUYWMg0t9FCeKPojmzci0i', 'Fauzi Hayat, Lc', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fauzi%20Hayat%2C%20Lc', NULL, NULL, '2026-07-31 11:01:00'),
(54, 'firman', '$2b$10$ZUxeiqyAjor9yAswnddDs.Y0w5U79WoN0.DxjuImcdf39QS7B86Ua', 'Firman Surya, Lc, Desa', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Firman%20Surya%2C%20Lc%2C%20Desa', NULL, NULL, '2026-07-31 11:01:00'),
(55, 'muallim', '$2b$10$enafL03NULgztVChpDYuw.erCpp82z6MvGfgwnf5VRmaD6KE5CTmO', 'Muallim Bakram, Lc,Ma', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Muallim%20Bakram%2C%20Lc%2CMa', NULL, NULL, '2026-07-31 11:01:00'),
(56, 'desnedi', '$2b$10$7RYMOQNjaOi7oUTJxcYMDuzjw7zUqvXekoV8cNcyMW5CrHkgsls1O', 'Desnedi, S.S', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Desnedi%2C%20S.S', NULL, NULL, '2026-07-31 11:01:01'),
(57, 'najmuddin', '$2b$10$jEL9yKcOsRtdXWO6Ls8a8unREelhQtTuwOftFVbLpnDZ0a/YghQP2', 'Najmuddin Eko Santoso', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Najmuddin%20Eko%20Santoso', NULL, NULL, '2026-07-31 11:01:01'),
(58, 'ummi', '$2b$10$w9S.FAitLUwOH7gQo1Iy8e2kfDUplmaiBk.yKCvqSEQfQiExLIRpm', 'Ummi Hustiah Husni Said, Lc, MA', 'guru', '[\"guru\"]', NULL, 'P', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ummi%20Hustiah%20Husni%20Said%2C%20Lc%2C%20MA', NULL, NULL, '2026-07-31 11:01:01'),
(59, 'muhammad3', '$2b$10$2EC.xTEgEKrWTCcKpqDnu.XH7CUr6ACP.76c7OjUcv4msXV5y/gXS', 'Muhammad Akhyar Rifqi, Lc, MH', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Muhammad%20Akhyar%20Rifqi%2C%20Lc%2C%20MH', NULL, NULL, '2026-07-31 11:01:01'),
(60, 'helmi', '$2b$10$XRfs64taP.FO1Mle3oVl/OpfyD.wztMruBMLqxqepZmTlk24wvep6', 'Helmi Hidayat, ST, M.Pd', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Helmi%20Hidayat%2C%20ST%2C%20M.Pd', NULL, NULL, '2026-07-31 11:01:01'),
(61, 'wamdi', '$2b$10$kbPbc7v.FVtYnMdTOGTNoukLkUW.IjGZfrFRuR604LLDztmS64klq', 'Wamdi, S.Pd.I., M.H.Gr', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wamdi%2C%20S.Pd.I.%2C%20M.H.Gr', NULL, NULL, '2026-07-31 11:01:01'),
(62, 'usman', '$2b$10$Y4Ip2kxNbv8Rv2E.CNgK8um3.jXoNiJpybhU850g8//Z1bLvDlhC.', 'Usman, S.Pd', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Usman%2C%20S.Pd', NULL, NULL, '2026-07-31 11:01:01'),
(63, 'khairuddin', '$2b$10$GT830dY5MrowG5ObseSvoOq7wG84lDUl3hRIkzQDXnusL7D9blFfK', 'Khairuddin, Lc.,M.H', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khairuddin%2C%20Lc.%2CM.H', NULL, NULL, '2026-07-31 11:01:01'),
(64, 'wahidussomad', '$2b$10$dJGHK8dX5Nv4jlDFUaHGKe6hLcGLCcmgHZUUWarrEBCLUOZILYX8a', 'Wahidussomad, Lc, M.Sy', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wahidussomad%2C%20Lc%2C%20M.Sy', NULL, NULL, '2026-07-31 11:01:01'),
(65, 'afrinaldo', '$2b$10$ODZCSPEwLIcJviCtc78nKukFy14mGHAZIIyBtZdjbuCjqPKbZeDi.', 'Afrinaldo, A.md', 'guru', '[\"guru\"]', NULL, 'L', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Afrinaldo%2C%20A.md', NULL, NULL, '2026-07-31 11:01:01'),
(66, 'abrizan', '$2b$10$WgE9zl3etGOakz85MrI4aOSUVpjaqmojjGyHJHsNvIOQnlQGi/ZNi', 'Ayah/Bunda Ananda ABRIZAN HARITZ MORALISETYO', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20ABRIZAN%20HARITZ%20MORALISETYO', NULL, NULL, '2026-07-31 12:33:34'),
(67, 'akif', '$2b$10$vqnXHmfgUnlu6Nbf53wBte4zsAWrKicIFcobc99xO6TRVx4B2rgBC', 'Ayah/Bunda Ananda AKIF MUHAMMAD DZAKIY', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20AKIF%20MUHAMMAD%20DZAKIY', NULL, NULL, '2026-07-31 12:33:34'),
(68, 'alden', '$2b$10$fYZh0/ptC5enkzwMgms.c.BfZ.KBfqp7eXRVja4UZkC6WpQShrQ0u', 'Ayah/Bunda Ananda ALDEN HAFIZUDDIN AZIZAN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20ALDEN%20HAFIZUDDIN%20AZIZAN', NULL, NULL, '2026-07-31 12:33:34'),
(69, 'athif', '$2b$10$rz86kWDSCGcAOb54WxyGBOBYaa8dELc6woxZzPneBpGMluGjSC4cK', 'Ayah/Bunda Ananda ATHIF ABDURRAHMAN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20ATHIF%20ABDURRAHMAN', NULL, NULL, '2026-07-31 12:33:34'),
(70, 'daffa', '$2b$10$ZFnCjfWSdpgN9OxxoH7ixu92Ag0hzlv5ZsCRg93or8JzDyCJ4o9ry', 'Ayah/Bunda Ananda DAFFA REZKY HABIBI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20DAFFA%20REZKY%20HABIBI', NULL, NULL, '2026-07-31 12:33:34'),
(71, 'fadhil', '$2b$10$aaK/k0m0AX2WJWah.Gs35uHW9HlnujH/VRJwrwRL9oa65HXxBsBte', 'Ayah/Bunda Ananda FADHIL HADI ARRASYID', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20FADHIL%20HADI%20ARRASYID', NULL, NULL, '2026-07-31 12:33:34'),
(72, 'faiq', '$2b$10$pj1u/ty6G3ZDd229uoBLn.dsFuLq6yX0gmCAB90XHXHDgUD/ZlYa6', 'Ayah/Bunda Ananda FAIQ ANUGERAH', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20FAIQ%20ANUGERAH', NULL, NULL, '2026-07-31 12:33:34'),
(73, 'fatih', '$2b$10$lMQssWYQPOFLG8bpLfMfA.6YhWCLM/nke0utygn2dPTMJW5Jcy8Qu', 'Ayah/Bunda Ananda FATIH MUHAMMAD ALFARIQ', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20FATIH%20MUHAMMAD%20ALFARIQ', NULL, NULL, '2026-07-31 12:33:35'),
(74, 'fawwaz', '$2b$10$nQpQ7Fp2rEuD0teUpxrBa.q.XdxWQ9izvkSTfYSPSzPh/QrnsOl5a', 'Ayah/Bunda Ananda FAWWAZ AULIA ANMAR', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20FAWWAZ%20AULIA%20ANMAR', NULL, NULL, '2026-07-31 12:33:35'),
(75, 'fuad', '$2b$10$06ckwggj4xqUfCLa1HQWKePGq3lZwTSAAGcX0hzjSXJtCGyG7AGra', 'Ayah/Bunda Ananda FUAD AL HUSAINI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20FUAD%20AL%20HUSAINI', NULL, NULL, '2026-07-31 12:33:35'),
(76, 'ghazi', '$2b$10$czrJgq4pCOeFxIU9wx6DjukR96KEbsPI4ij8FHOXQVlrTJ4FhMd86', 'Ayah/Bunda Ananda GHAZI FADHIL HILMI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20GHAZI%20FADHIL%20HILMI', NULL, NULL, '2026-07-31 12:33:35'),
(77, 'irfan', '$2b$10$oNjpvz7iYB5QYcQIfkG1VuW28DuabUs6p/cOIrT6Gn4qeReAtZy5G', 'Ayah/Bunda Ananda IRFAN FATURRIZKI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20IRFAN%20FATURRIZKI', NULL, NULL, '2026-07-31 12:33:35'),
(78, 'jevan', '$2b$10$2OS1zQQEyXKbX8bcwU8VwuEWdcDLkPPu2NuSCvyOsF8OqekO/7Gq6', 'Ayah/Bunda Ananda JEVAN DANISH DHAIFULLAH ', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20JEVAN%20DANISH%20DHAIFULLAH%20', NULL, NULL, '2026-07-31 12:33:35'),
(79, 'khairul', '$2b$10$N0xBJtvXZXSUNHp32qRBeOE7k1wUv/pKRrLJlCVYe6m/gb1fSrr5K', 'Ayah/Bunda Ananda KHAIRUL ABDIL', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20KHAIRUL%20ABDIL', NULL, NULL, '2026-07-31 12:33:35'),
(80, 'm', '$2b$10$n0q6GyOi.9lJOez8bHJ8G.ySzlkkUYUD5G05aTPaS9eIF2DNwDoZe', 'Ayah/Bunda Ananda M. ZAKI MUBARRAQ DANI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20M.%20ZAKI%20MUBARRAQ%20DANI', NULL, NULL, '2026-07-31 12:33:35'),
(81, 'moh', '$2b$10$KQ6OTyqfh.5XoEgUcJasquT/kKAm8sWlnRBlTgLTaG.8zbK2ZsqFO', 'Ayah/Bunda Ananda MOH. FADIL ALFARISI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MOH.%20FADIL%20ALFARISI', NULL, NULL, '2026-07-31 12:33:35'),
(82, 'muhammad4', '$2b$10$gqOfpu1gLpN2hcbGx3KlJO4R1rVVM521rwM1AlwvO0GS3BGVaSZEe', 'Ayah/Bunda Ananda MUHAMMAD AZKA FIRMANSYAH', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MUHAMMAD%20AZKA%20FIRMANSYAH', NULL, NULL, '2026-07-31 12:33:35'),
(83, 'muhammad5', '$2b$10$zpfGcVYrGYp5fdwCBfzwSOtRHa7.wUnDg1Yeu1iaX7sgu0N7OGeCi', 'Ayah/Bunda Ananda MUHAMMAD SAID ALAMSYAH', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MUHAMMAD%20SAID%20ALAMSYAH', NULL, NULL, '2026-07-31 12:33:36'),
(84, 'muhammad6', '$2b$10$SVAAncJ8OWLq3QVYljEO/OxCpvEuiEaGfEcJSHDecpvKHttoCVsXK', 'Ayah/Bunda Ananda MUHAMMAD SULTAN FAKHRI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MUHAMMAD%20SULTAN%20FAKHRI', NULL, NULL, '2026-07-31 12:33:36'),
(85, 'muhammad7', '$2b$10$9ISNLMFLspKU0DnqGMueg.pj57O6ZCLMNxzkJrak7FPQZwvScl3bu', 'Ayah/Bunda Ananda MUHAMMAD YUSUF AL GHIFARI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MUHAMMAD%20YUSUF%20AL%20GHIFARI', NULL, NULL, '2026-07-31 12:33:36'),
(86, 'naufal', '$2b$10$BqXzEzZD4qQTFcwCZjWU1OLx3VFkAHAmIaclVdUBzDgw5ybvQu1tW', 'Ayah/Bunda Ananda NAUFAL DZAKI WIJAYA', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20NAUFAL%20DZAKI%20WIJAYA', NULL, NULL, '2026-07-31 12:33:36'),
(87, 'qurzadha', '$2b$10$peAG5VlkGQM.p6HEEM3zA.1cJg6.ittGipYkE9CTRDoZmROgkzZ5y', 'Ayah/Bunda Ananda QURZADHA ALFARIZI ADIANSYA', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20QURZADHA%20ALFARIZI%20ADIANSYA', NULL, NULL, '2026-07-31 12:33:36'),
(88, 'rahid', '$2b$10$jGfqKi7I7uYfCzaoWt5o3ezLVKLlfvUdVIc9Y54y/Tz4VJJ1E01ze', 'Ayah/Bunda Ananda RAHID RAMADHAN JAS', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20RAHID%20RAMADHAN%20JAS', NULL, NULL, '2026-07-31 12:33:36'),
(89, 'sahel', '$2b$10$pYMVxtTbhj1viRyqMnJFaeDwG1PztppieC33cXXdYIKzdrVwhY1s.', 'Ayah/Bunda Ananda SAHEL AIMAN SADAAD', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20SAHEL%20AIMAN%20SADAAD', NULL, NULL, '2026-07-31 12:33:36'),
(90, 'wafi', '$2b$10$Oglb8098adA5dYsVSeKy7.KHTxG.XoxbCFV4VyOhdp8HlYm6EA7oa', 'Ayah/Bunda Ananda WAFI ANRRI AKRAM', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20WAFI%20ANRRI%20AKRAM', NULL, NULL, '2026-07-31 12:33:36'),
(91, 'afdal', '$2b$10$G/DRN/XVKsq5hFc.CJPAD.FZ7pmGI0EzOZJM9UEf4wYBJnH80Kz3q', 'Ayah/Bunda Ananda AFDAL HIDAYATUL RAHMAT', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20AFDAL%20HIDAYATUL%20RAHMAT', NULL, NULL, '2026-07-31 12:33:36'),
(92, 'aditya', '$2b$10$8p4K7drZvRyde4LRgomPFOjQa4xUw9eQEG2Bc6IRQvzBLzvCOp.qK', 'Ayah/Bunda Ananda ADITYA DAFFA FATONI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20ADITYA%20DAFFA%20FATONI', NULL, NULL, '2026-07-31 12:33:36'),
(93, 'ahmad', '$2b$10$03VRRk9JHpAvfpHsq0t3MOqui9XdXH2kIH4jWt01hPz1ZQSoQthu2', 'Ayah/Bunda Ananda AHMAD HANNAN ZAIDAN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20AHMAD%20HANNAN%20ZAIDAN', NULL, NULL, '2026-07-31 12:33:36'),
(94, 'alif', '$2b$10$T9/3BTziUIFBOWxpWZLVBO3dz6vo6jKz46v6CYIL4B1I6T/vwy.3i', 'Ayah/Bunda Ananda ALIF KHALFANI AYDIN RAMADHAN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20ALIF%20KHALFANI%20AYDIN%20RAMADHAN', NULL, NULL, '2026-07-31 12:33:37'),
(95, 'bariq', '$2b$10$fTdgPOjigqKdDocRsS08d.es/wEdFrRh3yWBOVomeNVmd.oyJkUUq', 'Ayah/Bunda Ananda BARIQ ZABIR AHMADI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20BARIQ%20ZABIR%20AHMADI', NULL, NULL, '2026-07-31 12:33:37'),
(96, 'darma', '$2b$10$NqqiFmFXeVD3oBvTrh34DebF5YSGg1qZ77eyLf4Y/REO1V86L/7em', 'Ayah/Bunda Ananda DARMA WANSYAH', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20DARMA%20WANSYAH', NULL, NULL, '2026-07-31 12:33:37'),
(97, 'dzakwan', '$2b$10$z8F.amGWbXhevPszM8o8P..Q5VmIZ2mpb/KBVnBbZK8HqR.BAWmsG', 'Ayah/Bunda Ananda DZAKWAN AFKARI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20DZAKWAN%20AFKARI', NULL, NULL, '2026-07-31 12:33:37'),
(98, 'fadel', '$2b$10$Wa/LR0NNEVTAu9REzrOiTe4eSaLoqx8Iodb7arBZVTKuJ/S/JtnIy', 'Ayah/Bunda Ananda FADEL MUKHLISIN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20FADEL%20MUKHLISIN', NULL, NULL, '2026-07-31 12:33:37'),
(99, 'fariid', '$2b$10$vZFFkRaxhcenu2k3lAGjbO/x6ihj.UfKfd4z96i.n5IwsEf.1LLqu', 'Ayah/Bunda Ananda FARIID AL HAFIIZH', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20FARIID%20AL%20HAFIIZH', NULL, NULL, '2026-07-31 12:33:37'),
(100, 'fauzan', '$2b$10$rvIzkXZRf5dv/LZfslHFaezbZLF6S.JffqTFa4/CsTOf1VPfP4uB2', 'Ayah/Bunda Ananda FAUZAN KAMIL', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20FAUZAN%20KAMIL', NULL, NULL, '2026-07-31 12:33:37'),
(101, 'fazli', '$2b$10$Av6H8XHu8HBKHDC7OppLOem0CBYGVZwXJPmrtqBxQISPBA.D7aEi.', 'Ayah/Bunda Ananda FAZLI AZZAM', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20FAZLI%20AZZAM', NULL, NULL, '2026-07-31 12:33:37'),
(102, 'fudhail', '$2b$10$.VsA8IYOCkDv97Q2HT5FAuFdFIT4gTDiSy6FymoUR32i.2FjXu1fC', 'Ayah/Bunda Ananda FUDHAIL IHSAN AYYASHI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20FUDHAIL%20IHSAN%20AYYASHI', NULL, NULL, '2026-07-31 12:33:38'),
(103, 'm1', '$2b$10$7itoH0QRJYXP2ztqouv/yuBweBm94sSYkpoCAffxH8fNhTjIAv29i', 'Ayah/Bunda Ananda M. ZIDAN ', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20M.%20ZIDAN%20', NULL, NULL, '2026-07-31 12:33:38'),
(104, 'habri', '$2b$10$M0eflf4Y4H4d5k/5ihRhTOE1BzurJfbFjh0HiDe4A67/qCVtfmwUu', 'Ayah/Bunda Ananda HABRI GHASSANI ARDI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20HABRI%20GHASSANI%20ARDI', NULL, NULL, '2026-07-31 12:33:38'),
(105, 'khairil', '$2b$10$xc3ju.8ZrC2RzDtVs3/wMe.MsLjS4/IFblrKOImIn3whPqQPn/QD6', 'Ayah/Bunda Ananda KHAIRIL ABDIL', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20KHAIRIL%20ABDIL', NULL, NULL, '2026-07-31 12:33:38'),
(106, 'izzan', '$2b$10$hQrLbrER31Shp2X7yQuQ6O3A5ihxBhqhm/KiSs2tf9Qh410CDySBm', 'Ayah/Bunda Ananda IZZAN FARHAN AHMAD', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20IZZAN%20FARHAN%20AHMAD', NULL, NULL, '2026-07-31 12:33:38'),
(107, 'keefa', '$2b$10$aOJoT2RwAwclzlPQQBPkVeHgt8ZFiBTEdcN.mbVZBfGN3lapPett.', 'Ayah/Bunda Ananda KEEFA HAFIDZ IBADURRAHMAN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20KEEFA%20HAFIDZ%20IBADURRAHMAN', NULL, NULL, '2026-07-31 12:33:38'),
(108, 'm2', '$2b$10$YoiR0XruS7dP14fKuPbLUum2nEAUatqhr6yoVuoUMKfHzqythdpTi', 'Ayah/Bunda Ananda M. IRHAB NABIL', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20M.%20IRHAB%20NABIL', NULL, NULL, '2026-07-31 12:33:38'),
(109, 'mohammad', '$2b$10$5SEeBezOpvcTOXaKDxRLG.ao5Cg/2qNSXyNJzP56d/tGIxcHBBGAy', 'Ayah/Bunda Ananda MOHAMMAD AZKA ', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MOHAMMAD%20AZKA%20', NULL, NULL, '2026-07-31 12:33:39'),
(110, 'muhammad8', '$2b$10$W1BIBVKNMcHhgp8/ZN//aeBt2UaKAT1MZKGpy/8nYEQe3XqpW0XRe', 'Ayah/Bunda Ananda MUHAMMAD ABDURRAHMAN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MUHAMMAD%20ABDURRAHMAN', NULL, NULL, '2026-07-31 12:33:39'),
(111, 'muhammad9', '$2b$10$2NdAj1NSHJElc1CMZ6.uDO8qzj0E2p.BsAnOV9Zv3ZRPhgVqS9syW', 'Ayah/Bunda Ananda MUHAMMAD FAHRI KAMIL', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MUHAMMAD%20FAHRI%20KAMIL', NULL, NULL, '2026-07-31 12:33:39'),
(112, 'muhammad10', '$2b$10$juLRK8DyZ9FAwMdQG6AePeCndI/CGlfOqgL89Q4zZzk.Lma/rmWvK', 'Ayah/Bunda Ananda MUHAMMAD SOLIHIN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MUHAMMAD%20SOLIHIN', NULL, NULL, '2026-07-31 12:33:39'),
(113, 'naufal1', '$2b$10$21Dc8SfAw2MTw2f2Z/whnOw7bc8zBqAhI/VroXHQKFKrKdg2fB3JW', 'Ayah/Bunda Ananda NAUFAL ARIIQ FADHLURROHMAN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20NAUFAL%20ARIIQ%20FADHLURROHMAN', NULL, NULL, '2026-07-31 12:33:39'),
(114, 'naufal2', '$2b$10$R3QDmD4IaobqLQZFuqGFweRtjIAQk7fqMOL/eq2jV805DKFYURScK', 'Ayah/Bunda Ananda NAUFAL DZAKWAN HANIF', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20NAUFAL%20DZAKWAN%20HANIF', NULL, NULL, '2026-07-31 12:33:39'),
(115, 'rifqi', '$2b$10$vTUUFybG4K8qYY/WWdztg.VHJA9lTBWfBEBW7Y..TpOumvQ2GvbvK', 'Ayah/Bunda Ananda RIFQI DWI SETIAWAN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20RIFQI%20DWI%20SETIAWAN', NULL, NULL, '2026-07-31 12:33:39'),
(116, 'rizuka', '$2b$10$ZzntLWMABCES8VLu.8u1.O34GJ0vStpsP/Gq/ZqvrpaJvelQiMml.', 'Ayah/Bunda Ananda RIZUKA SYAHRIZA AZHARI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20RIZUKA%20SYAHRIZA%20AZHARI', NULL, NULL, '2026-07-31 12:33:39'),
(117, 'abid', '$2b$10$8sGyD1zH4nlucodKY01jQuRqHnjG./a.yuPjQslV3Kb6i0wBque26', 'Ayah/Bunda Ananda ABID YUSRI ABQARY', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20ABID%20YUSRI%20ABQARY', NULL, NULL, '2026-07-31 12:33:39'),
(118, 'agus', '$2b$10$Y/fBkrDWkXMH/86zeZVylezahAJFfPi4qXQ4IC2AX5GIYC0AaSsHm', 'Ayah/Bunda Ananda AGUS NUR RAMADANI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20AGUS%20NUR%20RAMADANI', NULL, NULL, '2026-07-31 12:33:39'),
(119, 'ahdal', '$2b$10$eS0dUOCYimw6uDivEB.JpOFdbZEAAP5jLyny6LkCGz//rAZESz7dS', 'Ayah/Bunda Ananda AHDAL ALI HAJJ', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20AHDAL%20ALI%20HAJJ', NULL, NULL, '2026-07-31 12:33:39'),
(120, 'ahmad1', '$2b$10$FFX/4aoNNu.FfLQ955Kv6uRW.MjyGVT.ck2tvC83ylN0TdK1IGQyq', 'Ayah/Bunda Ananda AHMAD AGHA ZIKRI SITOMPUL', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20AHMAD%20AGHA%20ZIKRI%20SITOMPUL', NULL, NULL, '2026-07-31 12:33:39'),
(121, 'alden1', '$2b$10$GsWNgJ1qf2VZkdOHUBS5N.aB4MomfM5r3sJUlXfrmfXlbx9VaGDBq', 'Ayah/Bunda Ananda ALDEN HAFIZUDDIN AZIZAN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20ALDEN%20HAFIZUDDIN%20AZIZAN', NULL, NULL, '2026-07-31 12:33:40'),
(122, 'attalariq', '$2b$10$p9/qe4tP9hpHyVN0ntRMwuatbaDnukQ9d.97EuMoS/38JqC7QJNKq', 'Ayah/Bunda Ananda ATTALARIQ SYAH HENDRIAN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20ATTALARIQ%20SYAH%20HENDRIAN', NULL, NULL, '2026-07-31 12:33:40'),
(123, 'byantara', '$2b$10$0ylj/vLXtgl9/y3sqU2YGultxXw39JdaXIIzXE0SCuGHGJ/SrisvG', 'Ayah/Bunda Ananda BYANTARA LUTHFI ARDANA', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20BYANTARA%20LUTHFI%20ARDANA', NULL, NULL, '2026-07-31 12:33:40'),
(124, 'daffa1', '$2b$10$xmj8ZkFAHG0vj2GdzaOyI.tvumoVROYDZJHaRdmiGZYUHtFaw2wm2', 'Ayah/Bunda Ananda DAFFA FAYYAD ARROFI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20DAFFA%20FAYYAD%20ARROFI', NULL, NULL, '2026-07-31 12:33:40'),
(125, 'fadhli', '$2b$10$s6mBbsqnZdeuzIWhoXzD/uECf7oPTdmBjb/HQYAeYqEKqfSG7KXJm', 'Ayah/Bunda Ananda FADHLI DZIL IKRAM', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20FADHLI%20DZIL%20IKRAM', NULL, NULL, '2026-07-31 12:33:40'),
(126, 'hafiz', '$2b$10$VMQ.pKZpqfg3CxFb7WKvQe95YXiCBHngKIK3Kjb0IBCOx13IXM466', 'Ayah/Bunda Ananda HAFIZ JABâ€™BAR MAULANA', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20HAFIZ%20JAB%E2%80%99BAR%20MAULANA', NULL, NULL, '2026-07-31 12:33:40'),
(127, 'ibnu', '$2b$10$tRzkw/k8Ri7T7f7nkVajre.3.e8//MA29K3x2emJY631YOTmQzZZu', 'Ayah/Bunda Ananda IBNU KHAIRAN KETAREN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20IBNU%20KHAIRAN%20KETAREN', NULL, NULL, '2026-07-31 12:33:40'),
(128, 'm3', '$2b$10$GjyrC4LN47quhxmonhgcKeOnvVG9ATWCO3cCxFeWxOb0M7UY6WftC', 'Ayah/Bunda Ananda M. FAQIH HALIM', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20M.%20FAQIH%20HALIM', NULL, NULL, '2026-07-31 12:33:40'),
(129, 'm4', '$2b$10$aLMPKYahwxBY07Aiu0KGUOn6i37JvxEblUyefZLZBC44J9kr.1G1S', 'Ayah/Bunda Ananda M. RAFFA NOVRIANZAH', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20M.%20RAFFA%20NOVRIANZAH', NULL, NULL, '2026-07-31 12:33:40'),
(130, 'm5', '$2b$10$YLpgq.WXPsVdWoJfB7IIIOtH9xi90.CIPUGc7PQecAL3ecM4OeP7a', 'Ayah/Bunda Ananda M. SYAUQI FIRDAUS', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20M.%20SYAUQI%20FIRDAUS', NULL, NULL, '2026-07-31 12:33:40'),
(131, 'muhammad11', '$2b$10$vta/MEDAV7qmk9nWY5EUmuJkmJn7f/8eqR5CBy1m.rdF.As3tMAfm', 'Ayah/Bunda Ananda MUHAMMAD AQIL ALFATH ELMAIS', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MUHAMMAD%20AQIL%20ALFATH%20ELMAIS', NULL, NULL, '2026-07-31 12:33:41'),
(132, 'muhammad12', '$2b$10$AmAWWko41cwdtYVmDQlWguRmnMMfSIlGYcM9nBt982mx8tzZ.DWsS', 'Ayah/Bunda Ananda MUHAMMAD FIKRI KHOIR', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MUHAMMAD%20FIKRI%20KHOIR', NULL, NULL, '2026-07-31 12:33:41'),
(133, 'muhammad13', '$2b$10$aemKdk8ys7WdWgnz31pZlO9hy630k0miOWZFJvWKjM/LZQgJg8N1y', 'Ayah/Bunda Ananda MUHAMMAD IBNU YUSUF', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MUHAMMAD%20IBNU%20YUSUF', NULL, NULL, '2026-07-31 12:33:41'),
(134, 'muhammad14', '$2b$10$V7dVQjjJdXiOneojc4r5vuEaYL/jhcIEwKvmsH1ko5VGzSXZOFLja', 'Ayah/Bunda Ananda MUHAMMAD MUMTAZUL AZKA', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20MUHAMMAD%20MUMTAZUL%20AZKA', NULL, NULL, '2026-07-31 12:33:41'),
(135, 'naufal3', '$2b$10$U3R1btaIeRSpRjPidlKgy.NXirbe7YGaMkN7RnWBKy/vWr7JcvvNK', 'Ayah/Bunda Ananda NAUFAL KHOIRUL AZHHAR', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20NAUFAL%20KHOIRUL%20AZHHAR', NULL, NULL, '2026-07-31 12:33:41'),
(136, 'nouval', '$2b$10$94DSY8lQxICRAm/WdeVad.XplVnakhx24GDxRAT.WyRonsHaLdBCC', 'Ayah/Bunda Ananda NOUVAL ADITYA NUGRAHA ZALUKHU', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20NOUVAL%20ADITYA%20NUGRAHA%20ZALUKHU', NULL, NULL, '2026-07-31 12:33:41'),
(137, 'reno', '$2b$10$0Hyx6YHo8vHUohaN2GLaRegwBbBSnRW8rJ.pLa.abjomtXD5e4bv2', 'Ayah/Bunda Ananda RENO PANGESTU', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20RENO%20PANGESTU', NULL, NULL, '2026-07-31 12:33:41'),
(138, 'riziq', '$2b$10$f4zs20d0cklYJgyRvqBKyufZtsBEla8qUPyhN9k/1bTD2LhN3oO4K', 'Ayah/Bunda Ananda RIZIQ FRIZIANSYAH', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20RIZIQ%20FRIZIANSYAH', NULL, NULL, '2026-07-31 12:33:41'),
(139, 'rizky', '$2b$10$0DyJDK99JxctBXZUVDDoKuQ5fH5WiaZNKDPQ.mXwvo3en76sOG88G', 'Ayah/Bunda Ananda RIZKY AL FARIZ', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20RIZKY%20AL%20FARIZ', NULL, NULL, '2026-07-31 12:33:41'),
(140, 'sayyid', '$2b$10$Jk7PHO.VSE/mPZl30vkT3OZMwbdZrjyp68rTBgzbqn.TO0VckcKPS', 'Ayah/Bunda Ananda SAYYID ALFATH FAEYZA', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20SAYYID%20ALFATH%20FAEYZA', NULL, NULL, '2026-07-31 12:33:41'),
(141, 'adi', '$2b$10$RXHxGVxD0WLdiD.Zq0P9Uu3H3EmJoDUg.IqxcScQanISfcHBy1Hae', 'Ayah/Bunda Ananda ADI ZAMRI RAHMAN', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20ADI%20ZAMRI%20RAHMAN', NULL, NULL, '2026-07-31 12:33:42'),
(142, 'ahmad2', '$2b$10$gIx.N7WOpSsYKLWQgckWK.Rax.3mIk51KHKpHr8/GrNV7UkWOTaEK', 'Ayah/Bunda Ananda AHMAD ABID', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20AHMAD%20ABID', NULL, NULL, '2026-07-31 12:33:42'),
(143, 'ahmad3', '$2b$10$s4/Rhnu8NWwtkoirrGRDVe0o.ZoQLRt1MAS16IZiPCjg0T8U0hvGq', 'Ayah/Bunda Ananda AHMAD ZAKKI AL-MUFLIH', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20AHMAD%20ZAKKI%20AL-MUFLIH', NULL, NULL, '2026-07-31 12:33:42'),
(144, 'al', '$2b$10$mYfSYQsY6QnYFhOzARBvKuWBYk9HS/RTWG5SmEWfV58XSEvK9Mqiq', 'Ayah/Bunda Ananda AL FIRASH FAYYAD AZROM', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20AL%20FIRASH%20FAYYAD%20AZROM', NULL, NULL, '2026-07-31 12:33:42'),
(145, 'alkindi', '$2b$10$AWMi0N4zPiXmcq3IBGcVnOheW/Ha3kWjRSW0lhQWKfJ.nZcD.gNsK', 'Ayah/Bunda Ananda ALKINDI ANOURI', 'ortu', '[\"ortu\"]', NULL, NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayah%2FBunda%20Ananda%20ALKINDI%20ANOURI', NULL, NULL, '2026-07-31 12:33:42');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
