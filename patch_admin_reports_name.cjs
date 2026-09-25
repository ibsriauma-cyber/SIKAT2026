const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminReports.tsx', 'utf-8');

const targetName = `    let reportName = 'Laporan';
    switch (selectedReportType) {
      case 'absensi_siswa':
        reportName = 'Laporan_Absensi_Siswa';
        break;
      case 'kinerja_guru':
        reportName = 'Laporan_Kinerja_Guru_Walas';
        break;
      case 'jurnal_guru':
        reportName = 'Jurnal_Harian_Guru';
        break;
      case 'sholat_pegawai':
        reportName = 'Rekap_Sholat_Zuhur_Pegawai';
        break;
      case 'sholat_siswa':
        reportName = 'Laporan_Sholat_Siswa';
        break;
    }`;

const replaceName = `    let reportName = 'Laporan';
    switch (selectedReportType) {
      case 'absensi_siswa':
        reportName = 'Laporan_Absensi_Siswa';
        break;
      case 'sholat_siswa':
        reportName = 'Laporan_Sholat_Siswa';
        break;
    }`;

if (code.includes(targetName)) {
  code = code.replace(targetName, replaceName);
  fs.writeFileSync('src/pages/AdminReports.tsx', code);
  console.log("Names replaced!");
} else {
  console.log("targetName not found!");
}
