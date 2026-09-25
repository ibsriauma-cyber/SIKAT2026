import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BackButtonHandler from "./components/BackButtonHandler";
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { DashboardGuru } from './pages/DashboardGuru';
import { DashboardWalas } from './pages/DashboardWalas';
import { Perizinan } from './pages/Perizinan';
import { CBT } from './pages/CBT';
import { Notifications } from './pages/Notifications';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { DashboardOrtu } from './pages/DashboardOrtu';
import { DashboardBK } from './pages/DashboardBK';
import { DashboardPustaka } from './pages/DashboardPustaka';
import { AdminUsers } from './pages/AdminUsers';
import { AdminStudents } from './pages/AdminStudents';
import { AdminAcademic } from './pages/AdminAcademic';
import { AdminCalendar } from './pages/AdminCalendar';
import { AdminSettings } from './pages/AdminSettings';
import { AdminResetData } from "./pages/AdminResetData";
import { AdminSarpras } from './pages/AdminSarpras';
import { AdminAnnouncements } from './pages/AdminAnnouncements';
import { AdminSubjects } from './pages/AdminSubjects';
import { AdminTermSettings } from './pages/AdminTermSettings';
import { AdminReports } from './pages/AdminReports';
import { MobileDashboard } from './pages/MobileDashboard';
import { useAuth } from './context/AuthContext';

// Import New Pages
import { DataSiswa, JadwalMengajar, Absensi, InputNilai, JurnalMengajar, PerangkatNgajar, AnalisisSiswa, Laporan, AbsensiZuhur } from './pages/GuruPages';
import { PemantauanPagi, NilaiSikap, SholatZuhurWalas, PrestasiWalas, BkWalas, JadwalPelajaranWalas } from './pages/WalasPages';
import { DataAnak, AbsensiAnak, NilaiAnak, PesanWaliKelas, SikapAnak } from './pages/OrtuPages';
import { BKPreventif, BKPengembangan, BKKuratif, BKPenyaluran, BKAdvokasi, BKAdministrasi } from './pages/BKPages';
import { LMSTugas } from './pages/LMSTugas';

import { SiswaHafalan } from './pages/SiswaHafalan';
import { GuruQuranHafalan } from './pages/GuruQuranHafalan';
import { KesiswaanSP } from './pages/KesiswaanSP';

import { DashboardSiswa } from './pages/DashboardSiswa';
import { SiswaNilai } from './pages/SiswaNilai';
import { PustakaAdministrasi, PustakaKoleksi, PustakaLayanan, PustakaLiterasi, PustakaDigitalisasi, PustakaPelaporan } from './pages/PustakaPages';
import { DashboardKamad, KamadMateriAjar, KamadIbadahSiswa, KamadKinerjaStaf, KamadApprovalIzin, KamadIbadahGuru, KamadLaporanBKPustaka } from './pages/KamadPages';
import { KesiswaanPrestasiPelanggaran, KesiswaanEkskul } from './pages/KesiswaanPages';
import { DashboardWakaKurikulum, DashboardWakaKesiswaan } from './pages/WakaTUPages';
import { InputJadwal } from './pages/InputJadwal';
import { AdminTeachingAssignments } from './pages/AdminTeachingAssignments';
import { DashboardGuruQuran, GuruQuranAbsensiDhuha, GuruQuranLaporanDhuha } from './pages/GuruQuranPages';

import { mockUsers, mockStudents, mockClasses, mockSubjects } from './data/mock';
import { apiClient } from './lib/apiClient';
import { remoteStorage } from './lib/remoteStorage';
import { testFirebaseConnection } from './lib/firebase';


function DataSyncLayer({ children }: { children: React.ReactNode }) {
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    testFirebaseConnection().catch(console.warn);
    Promise.all([apiClient('/sync'), remoteStorage.init()])
      .then(([res, _]: any) => {
        if (res && res.users) {
          const syncedUsers = res.users.map((u: any) => ({
            ...u,
            id: String(u.id),
            roles: [u.role],
            childId: u.child_id ? String(u.child_id) : undefined,
            childName: undefined // could map later if needed
          }));
          const syncedStudents = res.students.map((s: any) => ({
             ...s,
             id: String(s.id),
             grade: s.class_name ? s.class_name.split(' ')[0] : 'X',
             className: s.class_name || '',
             attendance: { present: 0, absent: 0, sick: 0, permission: 0 }
          }));
          const syncedClasses = res.classes.map((c: any) => ({
             ...c,
             id: String(c.id)
          }));
          // Mutate the arrays
          mockUsers.splice(0, mockUsers.length, ...syncedUsers);
          mockStudents.splice(0, mockStudents.length, ...syncedStudents);
          mockClasses.splice(0, mockClasses.length, ...syncedClasses);
          if (res.subjects) {
            const syncedSubjects = res.subjects.map((s: any) => ({ ...s, id: String(s.id) }));
            mockSubjects.splice(0, mockSubjects.length, ...syncedSubjects);
          }
        }
        setSynced(true);
      })
      .catch(err => {
        console.error('Failed to sync data from DB', err);
        setSynced(true);
      });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (!synced) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

function RoleBasedDashboard() {
  const { user } = useAuth();
  
  return (
    <>
      {/* Desktop Layout Dashboards */}
      <div className="hidden sm:block">
        {user?.role === 'guru' && <DashboardGuru />}
        {user?.role === 'walas' && <DashboardWalas />}
        {user?.role === 'admin' && <DashboardAdmin />}
        {user?.role === 'ortu' && <DashboardOrtu />}
        {user?.role === 'bk' && <DashboardBK />}
        {user?.role === 'pustaka' && <DashboardPustaka />}
        {user?.role === 'siswa' && <DashboardSiswa />}
        {user?.role === 'kamad' && <DashboardKamad />}
        {user?.role === 'wakakurikulum' && <DashboardWakaKurikulum />}
        {user?.role === 'wakakesiswaan' && <DashboardWakaKesiswaan />}
        {user?.role === 'guru_quran' && <DashboardGuru />}
      </div>

      {/* Mobile-optimized Dashboard with 3x3 Grid Menu */}
      <div className="block sm:hidden">
        <MobileDashboard />
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BackButtonHandler />
      <DataSyncLayer>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<RoleBasedDashboard />} />
              <Route path="leave" element={<Perizinan />} />
            <Route path="cbt" element={<CBT />} />
            <Route path="notifications" element={<Notifications />} />
            
            {/* Admin Routes */}
            <Route path="users" element={<AdminUsers />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="academic" element={<AdminAcademic />} />
            <Route path="kalender-akademik" element={<AdminCalendar />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="admin/reset" element={<AdminResetData />} />
            <Route path="admin/sarpras" element={<AdminSarpras />} />
            <Route path="admin/announcements" element={<AdminAnnouncements />} />
            <Route path="admin/subjects" element={<AdminSubjects />} />
            <Route path="admin/plotting" element={<AdminTeachingAssignments />} />
            <Route path="admin/terms" element={<AdminTermSettings />} />
            <Route path="admin/reports" element={<AdminReports />} />
            <Route path="admin/jadwal" element={<InputJadwal />} />
            
            {/* Guru Routes */}
            <Route path="data-siswa" element={<DataSiswa />} />
            <Route path="jadwal-mengajar" element={<JadwalMengajar />} />
            <Route path="jadwal-pelajaran-kelas" element={<JadwalPelajaranWalas />} />
            <Route path="absensi" element={<Absensi />} />
            <Route path="input-nilai" element={<InputNilai />} />
            <Route path="jurnal-mengajar" element={<JurnalMengajar />} />
            <Route path="perangkat-ngajar" element={<PerangkatNgajar />} />
            <Route path="analisis-siswa" element={<AnalisisSiswa />} />
            <Route path="lms-tugas" element={<LMSTugas />} />
            <Route path="laporan" element={<Laporan />} />
            <Route path="absensi-zuhur" element={<AbsensiZuhur />} />
            
            {/* Walas Routes */}
            <Route path="pemantauan" element={<PemantauanPagi />} />
            <Route path="nilai-sikap" element={<NilaiSikap />} />
            <Route path="sholat-zuhur" element={<SholatZuhurWalas />} />
            <Route path="prestasi-walas" element={<PrestasiWalas />} />
            <Route path="bk-walas" element={<BkWalas />} />
            
            
            {/* Waka Kesiswaan specific */}
            <Route path="kesiswaan/sp" element={<KesiswaanSP />} />

            
            {/* Guru Quran specific */}
            <Route path="guru-quran/hafalan" element={<GuruQuranHafalan />} />

            {/* Ortu Routes */}
            <Route path="anak" element={<DataAnak />} />
            <Route path="absensi-anak" element={<AbsensiAnak />} />
            <Route path="nilai-anak" element={<NilaiAnak />} />
            <Route path="pesan" element={<PesanWaliKelas />} />
            <Route path="sikap-anak" element={<SikapAnak />} />
            
            {/* Siswa Routes */}
            <Route path="siswa-nilai" element={<SiswaNilai />} />

            <Route path="siswa/hafalan" element={<SiswaHafalan />} />

            
            {/* BK Routes */}
            <Route path="preventif" element={<BKPreventif />} />
            <Route path="pengembangan" element={<BKPengembangan />} />
            <Route path="kuratif" element={<BKKuratif />} />
            <Route path="penyaluran" element={<BKPenyaluran />} />
            <Route path="advokasi" element={<BKAdvokasi />} />
            <Route path="administrasi-bk" element={<BKAdministrasi />} />
            
            {/* Pustaka Routes */}
            <Route path="administrasi" element={<PustakaAdministrasi />} />
            <Route path="koleksi" element={<PustakaKoleksi />} />
            <Route path="layanan" element={<PustakaLayanan />} />
            <Route path="literasi" element={<PustakaLiterasi />} />
            <Route path="digitalisasi" element={<PustakaDigitalisasi />} />
            <Route path="pelaporan" element={<PustakaPelaporan />} />

            {/* Waka Kurikulum Routes */}
            <Route path="kesiswaan/prestasi" element={<KesiswaanPrestasiPelanggaran />} />
            <Route path="kesiswaan/data" element={<AdminStudents />} />
            <Route path="kesiswaan/ekskul" element={<KesiswaanEkskul />} />
            <Route path="kurikulum/plotting" element={<AdminTeachingAssignments />} />
            <Route path="kurikulum/jadwal" element={<InputJadwal />} />
            <Route path="kurikulum/akademik" element={<AdminAcademic />} />
            <Route path="kurikulum/ujian" element={<CBT />} />
            
            {/* Kamad Routes */}
            <Route path="kamad/materi" element={<KamadMateriAjar />} />
            <Route path="kamad/ibadah-siswa" element={<KamadIbadahSiswa />} />
            <Route path="kamad/kinerja-staf" element={<KamadKinerjaStaf />} />
            <Route path="kamad/perizinan" element={<KamadApprovalIzin />} />
            <Route path="kamad/ibadah-guru" element={<KamadIbadahGuru />} />
            <Route path="kamad/laporan-bk-pustaka" element={<KamadLaporanBKPustaka />} />

            {/* Guru Quran Routes */}
            <Route path="guru-quran/dhuha" element={<GuruQuranAbsensiDhuha />} />
            <Route path="guru-quran/laporan" element={<GuruQuranLaporanDhuha />} />

            <Route path="*" element={
               <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-sm">
                <p>Halaman sedang dalam pengembangan.</p>
               </div>
            } />
          </Route>
        </Routes>
        </AuthProvider>
      </DataSyncLayer>
    </BrowserRouter>
  );
}
