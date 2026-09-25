const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

// Add state for pemantauanPagi and nilaiSikap
content = content.replace(
  "const [ibadahSiswa, setIbadahSiswa] = useState<any[]>([]);",
  "const [ibadahSiswa, setIbadahSiswa] = useState<any[]>([]);\n  const [pemantauanPagi, setPemantauanPagi] = useState<any[]>([]);\n  const [nilaiSikap, setNilaiSikap] = useState<any[]>([]);"
);

// Add to fetch Promises
content = content.replace(
  "apiClient('/crud.php?table=ibadah_siswa').catch(() => [])\n      ]);",
  "apiClient('/crud.php?table=ibadah_siswa').catch(() => []),\n        apiClient('/crud.php?table=pemantauan_pagi').catch(() => []),\n        apiClient('/crud.php?table=nilai_sikap').catch(() => [])\n      ]);"
);

// Add to fetch resolution
content = content.replace(
  "const [termRes, stuRes, clsRes, schRes, assignRes, attRes, grdRes, jurRes, ibaRes] = await Promise.all",
  "const [termRes, stuRes, clsRes, schRes, assignRes, attRes, grdRes, jurRes, ibaRes, pemRes, nsRes] = await Promise.all"
);

content = content.replace(
  "if (Array.isArray(ibaRes)) setIbadahSiswa(ibaRes);",
  "if (Array.isArray(ibaRes)) setIbadahSiswa(ibaRes);\n      if (Array.isArray(pemRes)) setPemantauanPagi(pemRes);\n      if (Array.isArray(nsRes)) setNilaiSikap(nsRes);"
);

// Add to reportType
content = content.replace(
  "useState<'presensi' | 'nilai' | 'jurnal' | 'analisis' | 'sholat_dhuha' | 'sholat_zuhur'>('presensi');",
  "useState<'presensi' | 'nilai' | 'jurnal' | 'analisis' | 'sholat_dhuha' | 'sholat_zuhur' | 'pemantauan_pagi' | 'nilai_sikap'>('presensi');"
);

fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log('GuruPages patched');
