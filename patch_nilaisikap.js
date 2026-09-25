const fs = require('fs');
let content = fs.readFileSync('src/pages/WalasPages.tsx', 'utf8');

const target = `export function NilaiSikap() {
    const students = useWalasStudents();
  const [grades, setGrades] = useState<Record<string, string>>({});
  useEffect(() => {
    setGrades(prev => {
      const initial = { ...prev };
      students.forEach(s => {
        if (!initial[s.id]) initial[s.id] = 'B';
      });
      return initial;
    });
  }, [students]);
  const handleUpdate = (id: string, val: string) => {
    setGrades(prev => ({ ...prev, [id]: val }));
  };
  const handleSave = () => {
      window.alert("Nilai sikap berhasil disimpan!");
  };
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Nilai Sikap & Karakter</h1>
      <Card>`;

const replacement = `export function NilaiSikap() {
  const { user } = useAuth();
  const students = useWalasStudents();
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [semester, setSemester] = useState('Ganjil');

  useEffect(() => {
    apiClient('/crud.php?table=academic_terms')
      .then(data => {
        if (Array.isArray(data)) {
          const activeTerm = data.find((t: any) => Boolean(t.is_active));
          if (activeTerm) setSemester(activeTerm.semester || 'Ganjil');
        }
      }).catch(console.error);
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      setLoading(true);
      apiClient('/crud.php?table=nilai_sikap')
        .then(data => {
          if (Array.isArray(data)) {
            const dateRecords = data.filter((r: any) => r.tanggal === selectedDate);
            setExistingRecords(dateRecords);
            
            const initial: Record<string, string> = {};
            students.forEach(s => {
              const record = dateRecords.find((r: any) => r.student_id == s.id);
              initial[s.id] = record ? record.nilai : 'B';
            });
            setGrades(initial);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [students, selectedDate]);

  const handleUpdate = (id: string, val: string) => {
    setGrades(prev => ({ ...prev, [id]: val }));
  };

  const handleSave = async () => {
    if (students.length === 0) return;
    setLoading(true);
    
    try {
      const savePromises = students.map(s => {
        const record = existingRecords.find(r => r.student_id == s.id);
        const data = {
          student_id: s.id,
          class_name: s.className,
          tanggal: selectedDate,
          semester: semester,
          nilai: grades[s.id] || 'B'
        };
        
        if (record) {
          return apiClient(\`/crud.php?table=nilai_sikap&id=\${record.id}\`, {
            method: 'PUT',
            body: JSON.stringify(data)
          });
        } else {
          return apiClient('/crud.php?table=nilai_sikap', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        }
      });
      
      await Promise.all(savePromises);
      if (user?.id) {
        await logKinerja(user.id, 'Mengisi Nilai Sikap & Karakter siswa');
      }
      window.alert("Nilai sikap berhasil disimpan!");
      
      const newData = await apiClient('/crud.php?table=nilai_sikap');
      if (Array.isArray(newData)) {
        setExistingRecords(newData.filter((r: any) => r.tanggal === selectedDate));
      }
    } catch (err) {
      console.error(err);
      window.alert("Gagal menyimpan data nilai sikap.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Nilai Sikap & Karakter</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-600">Tanggal:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <Card>`;

const start = content.indexOf('export function NilaiSikap() {');
const end = content.indexOf('      <Card>', start);
if (start !== -1 && end !== -1) {
    const toReplace = content.substring(start, end + 12);
    content = content.replace(toReplace, replacement);
    fs.writeFileSync('src/pages/WalasPages.tsx', content);
    console.log('Replaced');
} else {
    console.log('Not found');
}
