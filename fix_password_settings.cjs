const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminSettings.tsx', 'utf8');

code = code.replace(
    /const handlePasswordSave = \(e: React\.FormEvent\) => \{[\s\S]*?setTimeout\(\(\) => setSuccessMessage\(null\), 3000\);\s*\}\s*\};\s*/,
    `const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim()) {
      setErrorMessage('Username tidak boleh kosong.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (user) {
      const payload: any = { username: username.trim() };
      if (password) {
        payload.password = password;
        payload.rawPassword = password;
      }
      
      try {
        await apiClient(\`/crud.php?table=users&id=\${user.id}\`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        
        setPassword('');
        setConfirmPassword('');
        setSuccessMessage('Data login (username/password) berhasil diperbarui!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setErrorMessage('Gagal memperbarui data login: ' + err.message);
      }
    }
  };
`
);

// Remove bcrypt import if possible
code = code.replace(/import bcrypt from 'bcryptjs';\n/g, '');

fs.writeFileSync('src/pages/AdminSettings.tsx', code);
console.log('Fixed password change logic in AdminSettings.tsx');
