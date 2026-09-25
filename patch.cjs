const fs = require('fs');
let code = fs.readFileSync('src/pages/GuruPages.tsx', 'utf-8');

const target1 = `  const isLate = (currentHour > limitHour || currentHour === limitHour && currentMinute >= limitMinute) && selectedDate === new Date().toISOString().split('T')[0];

  if (isLate) {`;

const replacement1 = `  const isLate = (currentHour > limitHour || currentHour === limitHour && currentMinute >= limitMinute) && selectedDate === new Date().toISOString().split('T')[0];
  
  // Walas morning limit 07:30
  const isWalasMorningLate = (currentHour > 7 || (currentHour === 7 && currentMinute > 30)) && selectedDate === new Date().toISOString().split('T')[0] && selectedMapel === 'Presensi Wali Kelas';

  if (isLate) {`;

code = code.replace(target1, replacement1);

const target2 = `  const handleSetStatus = (id: string, status: string) => {`;
const replacement2 = `  const handleSetStatus = (id: string, status: string) => {`;

const target3 = `      {/* Schedule Warning Banner if not created by Wakakurikulum/Admin */}
      {schedulesLoaded && !isScheduleCreated && <Card className="border-amber-200 bg-amber-50 shadow-sm">`;

const replacement3 = `      {/* Walas Morning Late Warning */}
      {isWalasMorningLate && !isLate && (
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              <strong>Peringatan Keterlambatan:</strong> Anda mengisi presensi melewati batas ideal pukul 07:30 WIB. Anda masih dapat menyimpan presensi hingga batas akhir ({limitAbsenSiswa}), namun ini akan tercatat sebagai keterlambatan pada sistem Kepala Madrasah.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Schedule Warning Banner if not created by Wakakurikulum/Admin */}
      {schedulesLoaded && !isScheduleCreated && <Card className="border-amber-200 bg-amber-50 shadow-sm">`;

code = code.replace(target3, replacement3);

fs.writeFileSync('src/pages/GuruPages.tsx', code);
