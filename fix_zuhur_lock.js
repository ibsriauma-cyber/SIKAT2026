import fs from 'fs';
let code = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const target = `  const absensiKey = \`absenZuhur_\${user?.id}_\${today}\`;
  const [hasAbsen, setHasAbsen] = useState(typeof window !== 'undefined' ? remoteStorage.getItem(absensiKey) === 'true' : false);`;

const replacement = `  const absensiKey = \`absenZuhur_\${user?.id}_\${today}\`;
  const [hasAbsen, setHasAbsen] = useState(typeof window !== 'undefined' ? remoteStorage.getItem(absensiKey) === 'true' : false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const checkStatus = async () => {
      try {
        const dateISO = new Date().toISOString().split('T')[0];
        const data = await apiClient('/crud.php?table=ibadah_guru');
        if (Array.isArray(data)) {
          const alreadySubmitted = data.some((r: any) => String(r.user_id) === String(user.id) && String(r.date).startsWith(dateISO));
          if (alreadySubmitted) {
            setHasAbsen(true);
            remoteStorage.setItem(absensiKey, 'true');
          }
        }
      } catch (err) {
        console.error('Failed to check absensi zuhur', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, [user?.id, absensiKey]);`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/GuruPages.tsx', code);
    console.log("Success");
} else {
    console.log("Target not found");
}
