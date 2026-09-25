const fs = require('fs');
let content = fs.readFileSync('src/pages/WalasPages.tsx', 'utf8');

const str1 = `  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [semester, setSemester] = useState('Ganjil');`;

const replace1 = `  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [semester, setSemester] = useState('Ganjil');`;

content = content.replace(str1, replace1);

fs.writeFileSync('src/pages/WalasPages.tsx', content);
console.log("Injected isLocked!");
