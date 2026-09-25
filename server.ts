import express from 'express';
import { EventEmitter } from 'events';

export const globalEmitter = new EventEmitter();
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { pool } from './src/lib/mysqlWrapper';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import {
  firestoreDb,
  getCollectionDocs,
  getDocById,
  saveDoc,
  removeDoc,
  getKV,
  getAllKV,
  setKV,
  deleteKV
} from './src/lib/firestoreAdapter';

dotenv.config();



async function testPoolAndInit() {
  if (firestoreDb) {
    console.log('[Firebase] Google Firebase Firestore initialized and active.');
  }
}



async function ensureDatabaseColumns() {
  // Skipped for Postgres since we already fully initialized schema
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    const onUpdate = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    
    globalEmitter.on('update', onUpdate);
    
    req.on('close', () => {
      globalEmitter.off('update', onUpdate);
    });
  });


  // Ensure database columns on start
  testPoolAndInit().catch(console.error);

  // API Routes


  
  app.post('/api/trigger-update', (req, res) => {
    globalEmitter.emit('update', { timestamp: Date.now() });
    res.json({ success: true });
  });

  app.get('/api/health', async (req, res) => {
    try {
      res.json({
        status: 'ok',
        database: 'google_firebase_firestore',
        firestore: firestoreDb ? 'connected' : 'offline',
        message: 'Database Google Firebase Firestore active'
      });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  const allowedTables = [
    'academic_history', 'academic_terms', 'agenda', 'announcements', 'bk_cases',
    'cbt_exams', 'cbt_questions', 'cbt_submissions', 'classes', 'grades',
    'ibadah_guru', 'ibadah_siswa', 'kinerja_staf', 'leave_requests', 'materi_ajar', 'materi_objectives',
    'notifications', 'sarpras', 'schedules', 'student_attendance', 'students', 'pemantauan_pagi', 'nilai_sikap',
    'subjects', 'teacher_attendance', 'laporan_harian', 'teaching_assignments', 'users'
  ];

  app.all('/api/keyval.php', async (req, res) => {
    try {
      const method = req.method;
      if (method === 'GET') {
        const key = req.query.key as string;
        if (key) {
          const val = await getKV(key);
          return res.json({ value: val });
        } else {
          const all = await getAllKV();
          return res.json(all);
        }
      } else if (method === 'POST') {
        const { key, value } = req.body;
        if (!key || value === undefined) return res.status(400).json({ error: 'Missing key or value' });
        await setKV(key, String(value));
        return res.json({ status: 'success' });
      } else if (method === 'DELETE') {
        const key = req.query.key as string;
        await deleteKV(key);
        return res.json({ status: 'success' });
      } else {
        return res.status(405).json({ error: 'Method not allowed' });
      }
    } catch (e: any) {
      console.error('keyval error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  });

  app.all('/api/crud.php', (req, res, next) => {
    const table = req.query.table;
    const id = req.query.id;
    if (!table) return res.status(400).json({ error: 'Missing table param' });
    
    // Rewrite the url to match the existing Express routes
    if (id) {
      req.url = `/api/crud/${table}/${id}`;
    } else {
      req.url = `/api/crud/${table}`;
    }
    next();
  });

  app.get(['/api/crud/:table', '/api/data/:table'], async (req, res) => {
    const { table } = req.params;
    if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Forbidden table' });
    try {
      const rows = await getCollectionDocs(table);
      res.json(rows);
    } catch (err: any) {
      console.error(`Error querying table ${table}:`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.post(['/api/crud/:table', '/api/data/:table'], async (req, res) => {
    const { table } = req.params;
    if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Forbidden table' });
    try {
      const data = req.body;
      const existing = await getCollectionDocs(table);
      let id = data.id;
      if (!id) {
        const maxId = existing.reduce((max: number, x: any) => Math.max(max, Number(x.id) || 0), 0);
        id = maxId + 1;
      }
      await saveDoc(table, id, { ...data, id });
      globalEmitter.emit('update', { table, action: 'insert', id });
      res.json({ insertId: id, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put(['/api/crud/:table/:id', '/api/data/:table/:id'], async (req, res) => {
    const { table, id } = req.params;
    if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Forbidden table' });
    try {
      const data = req.body;
      await saveDoc(table, id, data);
      globalEmitter.emit('update', { table, action: 'update', id });
      res.json({ affectedRows: 1 });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete(['/api/crud/:table/:id', '/api/data/:table/:id'], async (req, res) => {
    const { table, id } = req.params;
    if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Forbidden table' });
    try {
      await removeDoc(table, id);
      globalEmitter.emit('update', { table, action: 'delete', id });
      res.json({ affectedRows: 1 });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  
  // Announcements from Firestore
  app.all(['/api/announcements', '/api/announcements.php'], async (req, res) => {
    try {
      const method = req.method;
      if (method === 'GET') {
        const rows = await getCollectionDocs('announcements');
        const formatted = rows.map((r: any) => ({
          ...r,
          id: String(r.id),
          category: r.category || 'Informasi',
          target: r.target || r.target_audience || 'Semua',
          date: r.date || r.created_at || new Date().toISOString().split('T')[0],
          isPublished: true
        }));
        res.json(formatted);
      } else if (method === 'POST') {
        const { title, content, target, category } = req.body;
        const id = Date.now().toString();
        await saveDoc('announcements', id, {
          id,
          title,
          content,
          target_audience: target || 'Semua',
          category: category || 'Informasi',
          created_at: new Date().toISOString()
        });
        res.json({ status: 'success', id });
      } else if (method === 'PUT') {
        const { id, title, content, target, category } = req.body;
        await saveDoc('announcements', id, { title, content, target_audience: target, category });
        res.json({ status: 'success' });
      } else if (method === 'DELETE') {
        const id = req.query.id || req.body.id;
        if (id) await removeDoc('announcements', id);
        res.json({ status: 'success' });
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    } catch (error: any) {
      console.error('Announcements error:', error.message);
      res.status(500).json({ error: 'Failed to process request' });
    }
  });

  app.post('/api/login.php', async (req, res) => {
    const { username, password } = req.body;
    try {
      const users = await getCollectionDocs('users');
      const search = String(username || '').trim().toLowerCase();
      const user = users.find((u: any) =>
        (u.username && String(u.username).toLowerCase() === search) ||
        (u.nuptk && String(u.nuptk).toLowerCase() === search) ||
        (u.nip && String(u.nip).toLowerCase() === search) ||
        (String(u.id) === search)
      );

      if (user) {
        let isPasswordCorrect = false;
        try {
          if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
            isPasswordCorrect = bcrypt.compareSync(password, user.password);
          } else {
            isPasswordCorrect = (user.password === password);
          }
        } catch (bcryptErr) {
          isPasswordCorrect = (user.password === password);
        }

        if (isPasswordCorrect) {
          return res.json({ status: 'success', user });
        }
      }
      return res.json({ status: 'error', message: 'Username / NIPTK atau password salah' });
    } catch (err: any) {
      return res.json({ status: 'error', message: err.message });
    }
  });

  app.get('/api/get_user.php', async (req, res) => {
    const { id } = req.query;
    try {
      const user = await getDocById('users', id as string);
      if (user) {
        return res.json({ status: 'success', user });
      }
      return res.json({ status: 'error', message: 'User not found' });
    } catch (err: any) {
      return res.json({ status: 'error', message: err.message });
    }
  });

  app.post('/api/update_avatar.php', async (req, res) => {
    const { user_id, avatar_base64 } = req.body;
    try {
      await saveDoc('users', user_id, { avatar: avatar_base64 });
      return res.json({ status: 'success', avatar_url: avatar_base64 });
    } catch (err: any) {
      return res.json({ status: 'error', message: err.message });
    }
  });

  app.post(['/api/request_reset', '/api/request_reset.php'], async (req, res) => {
    const { username } = req.body;
    try {
      const users = await getCollectionDocs('users');
      const u = users.find((x: any) => x.username === username || String(x.id) === String(username));
      if (u) {
        const notifId = Date.now().toString();
        await saveDoc('notifications', notifId, {
          id: notifId,
          user_id: 1,
          title: 'Permintaan Reset Password',
          message: `Pengguna ${u.name} (${u.username}) meminta reset password.`,
          type: 'warning',
          is_read: 0,
          created_at: new Date().toISOString()
        });
      }
      return res.json({ status: 'success' });
    } catch (err: any) {
      console.error(err);
      return res.json({ status: 'error', message: err.message });
    }
  });

  app.all('/api/notifications.php', (req, res, next) => {
    const userId = req.query.user_id;
    if (userId) {
      req.url = `/api/notifications/${userId}`;
    }
    next();
  });

  app.all('/api/notifications_read.php', (req, res, next) => {
    const id = req.query.id;
    if (id) {
      req.url = `/api/notifications/${id}/read`;
    }
    next();
  });

  app.get('/api/notifications/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
      const all = await getCollectionDocs('notifications');
      const userNotifs = all.filter((n: any) => String(n.user_id) === String(user_id) || String(n.user_id) === '1');
      res.json(userNotifs);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notifications/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
      await saveDoc('notifications', id, { is_read: 1 });
      res.json({ status: 'success' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/sync.php', async (req, res) => {
    try {
      const [users, students, classes, subjects] = await Promise.all([
        getCollectionDocs('users'),
        getCollectionDocs('students'),
        getCollectionDocs('classes'),
        getCollectionDocs('subjects')
      ]);
      res.json({ users, students, classes, subjects });
    } catch (error: any) {
      console.error('Database query error in sync.php:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.get(['/api/get_materi', '/api/get_materi.php'], async (req, res) => {
    try {
      const [materi, users, objectives] = await Promise.all([
        getCollectionDocs('materi_ajar'),
        getCollectionDocs('users'),
        getCollectionDocs('materi_objectives')
      ]);

      const userMap = new Map(users.map((u: any) => [String(u.id), u]));
      const objMap = new Map<string, string[]>();
      objectives.forEach((o: any) => {
        const mId = String(o.materi_id);
        if (!objMap.has(mId)) objMap.set(mId, []);
        objMap.get(mId)!.push(o.objective);
      });

      const formatted = materi.map((m: any) => {
        const author = userMap.get(String(m.user_id));
        return {
          ...m,
          name: author?.name || m.name || '',
          role: author?.role || m.role || '',
          class: m.class_name || m.class || '',
          objectives: objMap.get(String(m.id)) || m.objectives || []
        };
      });

      res.json({ status: 'success', data: formatted });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post(['/api/save_materi', '/api/save_materi.php'], async (req, res) => {
    try {
      const { id, user_id, subject, class_name, title, description, file_name, status, date, objectives } = req.body;
      const materiId = id || Date.now();
      await saveDoc('materi_ajar', materiId, {
        id: materiId,
        user_id,
        subject,
        class_name,
        title,
        description,
        file_name,
        status,
        date
      });

      if (objectives && Array.isArray(objectives)) {
        for (let i = 0; i < objectives.length; i++) {
          const objId = `${materiId}_${i}`;
          await saveDoc('materi_objectives', objId, {
            id: objId,
            materi_id: materiId,
            objective: objectives[i]
          });
        }
      }

      res.json({ status: 'success', id: materiId });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post(['/api/delete_materi', '/api/delete_materi.php'], async (req, res) => {
    try {
      const { id } = req.body;
      if (id) {
        await removeDoc('materi_ajar', id);
      }
      res.json({ status: 'success' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get(['/api/sarpras', '/api/sarpras.php'], async (req, res) => {
    try {
      const rows = await getCollectionDocs('sarpras');
      res.json(rows);
    } catch (error: any) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Failed to fetch sarpras data' });
    }
  });

  app.post(['/api/query', '/api/query.php'], async (req, res) => {
    try {
      const { query: sqlQuery } = req.body;
      if (typeof sqlQuery === 'string') {
        const trimmed = sqlQuery.trim();
        if (/^delete\s+from\s+/i.test(trimmed)) {
          const match = trimmed.match(/^delete\s+from\s+(\w+)\s*(where\s+(.*))?$/i);
          if (match) {
            const table = match[1];
            if (allowedTables.includes(table)) {
              const docs = await getCollectionDocs(table);
              const whereClause = match[3];
              if (whereClause) {
                const conds = whereClause.split(/\s+and\s+/i);
                for (const docItem of [...docs]) {
                  let matches = true;
                  for (const cond of conds) {
                    const m = cond.match(/(\w+)\s*=\s*'([^']*)'/);
                    if (m) {
                      const col = m[1];
                      const val = m[2];
                      if (String(docItem[col]) !== val) {
                        matches = false;
                        break;
                      }
                    }
                  }
                  if (matches && docItem.id) {
                    await removeDoc(table, docItem.id);
                  }
                }
              }
            }
          }
        }
      }
      res.json({ status: 'success', affectedRows: 1 });
    } catch (err: any) {
      console.error('query.php error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get(['/api/stats', '/api/stats.php'], async (req, res) => {
    try {
      const [users, students, classes] = await Promise.all([
        getCollectionDocs('users'),
        getCollectionDocs('students'),
        getCollectionDocs('classes')
      ]);
      res.json({
        totalUsers: users.length,
        totalStudents: students.length,
        activeClasses: classes.length,
        attendanceRate: 98,
        users: users.length,
        students: students.length,
        classes: classes.length
      });
    } catch (error: any) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });



  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
