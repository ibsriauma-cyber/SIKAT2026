import express from 'express';
import { EventEmitter } from 'events';

export const globalEmitter = new EventEmitter();
import path from 'path';
import fs from 'fs';
import { pool } from './src/lib/mysqlWrapper';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import cors from 'cors';

dotenv.config();

// In-memory cache for fast read responses (<1ms)
const tableCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_TTL = 3000; // 3 seconds TTL

function invalidateCache(table?: string) {
  if (table) {
    tableCache.delete(table);
  } else {
    tableCache.clear();
  }
}

async function getCachedTableData(table: string): Promise<any[]> {
  const cached = tableCache.get(table);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  const [rows]: any = await pool.query(`SELECT * FROM \`${table}\``);
  const data = Array.isArray(rows) ? rows : [];
  tableCache.set(table, { data, timestamp: Date.now() });
  return data;
}

const allowedTables = [
  'academic_history', 'academic_terms', 'agenda', 'announcements', 'bk_cases',
  'cbt_exams', 'cbt_questions', 'cbt_submissions', 'classes', 'grades',
  'ibadah_guru', 'ibadah_siswa', 'kinerja_staf', 'leave_requests', 'materi_ajar', 'materi_objectives',
  'notifications', 'sarpras', 'schedules', 'student_attendance', 'students', 'pemantauan_pagi', 'nilai_sikap',
  'subjects', 'teacher_attendance', 'laporan_harian', 'teaching_assignments', 'users', 'key_value_store'
];

export const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Method override middleware for PUT and DELETE tunneling
app.use((req, res, next) => {
  const override = req.headers['x-http-method-override'] || req.headers['x-method'] || req.query._method;
  if (override) {
    req.method = String(override).toUpperCase();
  }
  next();
});

// Realtime Server-Sent Events (SSE)
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onUpdate = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  globalEmitter.on('update', onUpdate);

  req.on('close', () => {
    globalEmitter.off('update', onUpdate);
  });
});

app.post('/api/trigger-update', (req, res) => {
  invalidateCache();
  globalEmitter.emit('update', { timestamp: Date.now() });
  res.json({ success: true });
});

app.get(['/api/health', '/api/health.php'], async (req, res) => {
  try {
    const [r]: any = await pool.query('SELECT 1 as ping');
    res.json({
      status: 'ok',
      database: 'mysql_realtime',
      connected: Boolean(r && r[0]?.ping),
      message: 'Realtime MySQL Database Active'
    });
  } catch (e: any) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// Key-Value Store endpoint (/api/keyval.php and /api/keyval)
app.all(['/api/keyval', '/api/keyval.php'], async (req, res) => {
  try {
    const method = req.method;
    if (method === 'GET') {
      const key = req.query.key as string;
      if (key) {
        const [rows]: any = await pool.query('SELECT v FROM `key_value_store` WHERE `k` = ?', [key]);
        const val = rows && rows[0] ? rows[0].v : null;
        return res.json({ value: val });
      } else {
        const [rows]: any = await pool.query('SELECT `k`, `v` FROM `key_value_store`');
        const all: Record<string, string> = {};
        if (Array.isArray(rows)) {
          rows.forEach((r: any) => {
            all[r.k] = r.v;
          });
        }
        return res.json(all);
      }
    } else if (method === 'POST') {
      const { key, value } = req.body;
      if (!key || value === undefined) return res.status(400).json({ error: 'Missing key or value' });
      await pool.query('REPLACE INTO `key_value_store` (`k`, `v`) VALUES (?, ?)', [key, String(value)]);
      globalEmitter.emit('update', { table: 'key_value_store', key });
      return res.json({ status: 'success' });
    } else if (method === 'DELETE') {
      const key = req.query.key as string;
      if (key) {
        await pool.query('DELETE FROM `key_value_store` WHERE `k` = ?', [key]);
      } else {
        await pool.query('DELETE FROM `key_value_store`');
      }
      globalEmitter.emit('update', { table: 'key_value_store', key });
      return res.json({ status: 'success' });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e: any) {
    console.error('keyval error:', e.message);
    return res.status(500).json({ error: e.message });
  }
});

// URL rewrite for crud.php
app.all('/api/crud.php', (req, res, next) => {
  const table = req.query.table as string;
  const id = req.query.id as string;
  if (!table) return res.status(400).json({ error: 'Missing table param' });

  if (id) {
    req.url = `/api/crud/${table}/${id}`;
  } else {
    req.url = `/api/crud/${table}`;
  }
  next();
});

// Generic CRUD GET
app.get(['/api/crud/:table', '/api/data/:table'], async (req, res) => {
  const { table } = req.params;
  if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Forbidden table' });
  try {
    const rows = await getCachedTableData(table);
    res.json(rows);
  } catch (err: any) {
    console.error(`Error querying table ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generic CRUD POST
app.post(['/api/crud/:table', '/api/data/:table'], async (req, res) => {
  const { table } = req.params;
  if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Forbidden table' });
  try {
    const data = req.body;
    const [cols]: any = await pool.query(`SHOW COLUMNS FROM \`${table}\``);
    const validCols = new Set(cols.map((c: any) => c.Field));

    if (Array.isArray(data)) {
      if (data.length === 0) return res.json({ status: 'success', count: 0 });
      for (const item of data) {
        const insertObj: any = {};
        for (const [key, val] of Object.entries(item)) {
          if (validCols.has(key)) {
            insertObj[key] = val;
          }
        }
        const keys = Object.keys(insertObj);
        if (keys.length > 0) {
          const placeholders = keys.map(() => '?').join(', ');
          const values = keys.map(k => insertObj[k]);
          const sql = `REPLACE INTO \`${table}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;
          await pool.query(sql, values);
        }
      }
      invalidateCache(table);
      globalEmitter.emit('update', { table, action: 'insert_batch', count: data.length });
      return res.json({ status: 'success', count: data.length });
    }

    const insertObj: any = {};
    for (const [key, val] of Object.entries(data)) {
      if (validCols.has(key)) {
        insertObj[key] = val;
      }
    }

    const keys = Object.keys(insertObj);
    if (keys.length === 0) return res.status(400).json({ error: 'No valid columns provided' });

    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(k => insertObj[k]);
    const sql = `REPLACE INTO \`${table}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;

    const [result]: any = await pool.query(sql, values);
    const insertId = result.insertId || insertObj.id;

    invalidateCache(table);
    globalEmitter.emit('update', { table, action: 'insert', id: insertId });
    res.json({ insertId, id: insertId });
  } catch (err: any) {
    console.error(`Error inserting into ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generic CRUD PUT
app.put(['/api/crud/:table/:id', '/api/data/:table/:id'], async (req, res) => {
  const { table, id } = req.params;
  if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Forbidden table' });
  try {
    const data = req.body;
    const [cols]: any = await pool.query(`SHOW COLUMNS FROM \`${table}\``);
    const validCols = new Set(cols.map((c: any) => c.Field));

    const updateObj: any = {};
    for (const [key, val] of Object.entries(data)) {
      if (validCols.has(key) && key !== 'id') {
        updateObj[key] = val;
      }
    }

    const keys = Object.keys(updateObj);
    if (keys.length > 0) {
      const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
      const values = [...keys.map(k => updateObj[k]), id];
      const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ` + (table === 'key_value_store' ? '`k` = ?' : '`id` = ?');
      await pool.query(sql, values);
    }

    invalidateCache(table);
    globalEmitter.emit('update', { table, action: 'update', id });
    res.json({ affectedRows: 1 });
  } catch (err: any) {
    console.error(`Error updating ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generic CRUD DELETE
app.delete(['/api/crud/:table/:id', '/api/data/:table/:id'], async (req, res) => {
  const { table, id } = req.params;
  if (!allowedTables.includes(table)) return res.status(403).json({ error: 'Forbidden table' });
  try {
    const idCol = table === 'key_value_store' ? '`k`' : '`id`';
    await pool.query(`DELETE FROM \`${table}\` WHERE ${idCol} = ?`, [id]);
    invalidateCache(table);
    globalEmitter.emit('update', { table, action: 'delete', id });
    res.json({ affectedRows: 1 });
  } catch (err: any) {
    console.error(`Error deleting from ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Announcements
app.all(['/api/announcements', '/api/announcements.php'], async (req, res) => {
  try {
    const method = req.method;
    if (method === 'GET') {
      const rows: any = await getCachedTableData('announcements');
      const formatted = rows.map((r: any) => ({
        ...r,
        id: String(r.id),
        title: r.title || '',
        content: r.content || '',
        category: r.category || 'Informasi',
        target: r.target || r.target_audience || 'Semua',
        date: r.date || r.created_at || new Date().toISOString().split('T')[0],
        isPublished: true
      }));
      res.json(formatted);
    } else if (method === 'POST') {
      const { title, content, target, category } = req.body;
      const targetAudience = target || req.body.target_audience || 'Semua';
      const [result]: any = await pool.query(
        'INSERT INTO `announcements` (`title`, `content`, `target_audience`, `created_at`) VALUES (?, ?, ?, NOW())',
        [title, content, targetAudience]
      );
      invalidateCache('announcements');
      globalEmitter.emit('update', { table: 'announcements', action: 'insert' });
      res.json({ status: 'success', id: result.insertId });
    } else if (method === 'PUT') {
      const { id, title, content, target } = req.body;
      const targetAudience = target || req.body.target_audience || 'Semua';
      await pool.query(
        'UPDATE `announcements` SET `title` = ?, `content` = ?, `target_audience` = ? WHERE `id` = ?',
        [title, content, targetAudience, id]
      );
      invalidateCache('announcements');
      globalEmitter.emit('update', { table: 'announcements', action: 'update', id });
      res.json({ status: 'success' });
    } else if (method === 'DELETE') {
      const id = req.query.id || req.body.id;
      if (id) {
        await pool.query('DELETE FROM `announcements` WHERE `id` = ?', [id]);
        invalidateCache('announcements');
        globalEmitter.emit('update', { table: 'announcements', action: 'delete', id });
      }
      res.json({ status: 'success' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Announcements error:', error.message);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Login
app.post(['/api/login', '/api/login.php'], async (req, res) => {
  const { username, password } = req.body;
  try {
    const users: any = await getCachedTableData('users');
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
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
          isPasswordCorrect = bcrypt.compareSync(password, user.password);
        } else {
          isPasswordCorrect = (user.password === password);
        }
      } catch (bcryptErr) {
        isPasswordCorrect = (user.password === password);
      }

      if (isPasswordCorrect) {
        const cleanUser = { ...user };
        delete cleanUser.password;
        return res.json({ status: 'success', user: cleanUser });
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
    const [rows]: any = await pool.query('SELECT * FROM `users` WHERE `id` = ?', [id]);
    if (rows && rows[0]) {
      const user = { ...rows[0] };
      delete user.password;
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
    await pool.query('UPDATE `users` SET `avatar` = ? WHERE `id` = ?', [avatar_base64, user_id]);
    invalidateCache('users');
    return res.json({ status: 'success', avatar_url: avatar_base64 });
  } catch (err: any) {
    return res.json({ status: 'error', message: err.message });
  }
});

app.post(['/api/request_reset', '/api/request_reset.php'], async (req, res) => {
  const { username } = req.body;
  try {
    const users: any = await getCachedTableData('users');
    const u = users.find((x: any) => x.username === username || String(x.id) === String(username));
    if (u) {
      await pool.query(
        'INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW())',
        [1, 'Permintaan Reset Password', `Pengguna ${u.name} (${u.username}) meminta reset password.`, 'warning', 0]
      );
      invalidateCache('notifications');
      globalEmitter.emit('update', { table: 'notifications' });
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
    const [rows]: any = await pool.query(
      'SELECT * FROM `notifications` WHERE `user_id` = ? OR `user_id` = 1 ORDER BY `created_at` DESC',
      [user_id]
    );
    res.json(rows || []);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE `notifications` SET `is_read` = 1 WHERE `id` = ?', [id]);
    invalidateCache('notifications');
    res.json({ status: 'success' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sync.php', async (req, res) => {
  try {
    const [users, students, classes, subjects] = await Promise.all([
      getCachedTableData('users'),
      getCachedTableData('students'),
      getCachedTableData('classes'),
      getCachedTableData('subjects')
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
      getCachedTableData('materi_ajar'),
      getCachedTableData('users'),
      getCachedTableData('materi_objectives')
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

app.get(['/api/kinerja_bundle', '/api/kinerja_bundle.php'], async (req, res) => {
  try {
    const [
      users,
      kinerja,
      schedules,
      assignments,
      studentAttendance,
      pemantauanPagi,
      nilaiSikap,
      ibadahSiswa,
      laporanHarian,
      materiAjar,
      classes
    ] = await Promise.all([
      getCachedTableData('users'),
      getCachedTableData('kinerja_staf'),
      getCachedTableData('schedules'),
      getCachedTableData('teaching_assignments'),
      getCachedTableData('student_attendance'),
      getCachedTableData('pemantauan_pagi'),
      getCachedTableData('nilai_sikap'),
      getCachedTableData('ibadah_siswa'),
      getCachedTableData('laporan_harian'),
      getCachedTableData('materi_ajar'),
      getCachedTableData('classes')
    ]);

    res.json({
      status: 'success',
      data: {
        users,
        kinerja,
        schedules,
        assignments,
        studentAttendance,
        pemantauanPagi,
        nilaiSikap,
        ibadahSiswa,
        laporanHarian,
        materiAjar,
        classes
      }
    });
  } catch (error: any) {
    console.error('kinerja_bundle error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.post(['/api/save_materi', '/api/save_materi.php'], async (req, res) => {
  try {
    const { id, user_id, subject, class_name, title, description, file_name, status, date, objectives } = req.body;
    let materiId = id;
    if (id) {
      await pool.query(
        'UPDATE `materi_ajar` SET `user_id` = ?, `subject` = ?, `class_name` = ?, `title` = ?, `description` = ?, `file_name` = ?, `status` = ?, `date` = ? WHERE `id` = ?',
        [user_id, subject, class_name, title, description, file_name, status, date, id]
      );
      await pool.query('DELETE FROM `materi_objectives` WHERE `materi_id` = ?', [id]);
    } else {
      const [result]: any = await pool.query(
        'INSERT INTO `materi_ajar` (`user_id`, `subject`, `class_name`, `title`, `description`, `file_name`, `status`, `date`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, subject, class_name, title, description, file_name, status, date]
      );
      materiId = result.insertId;
    }

    if (objectives && Array.isArray(objectives)) {
      for (const obj of objectives) {
        await pool.query('INSERT INTO `materi_objectives` (`materi_id`, `objective`) VALUES (?, ?)', [materiId, obj]);
      }
    }

    invalidateCache('materi_ajar');
    invalidateCache('materi_objectives');
    globalEmitter.emit('update', { table: 'materi_ajar' });
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
      await pool.query('DELETE FROM `materi_objectives` WHERE `materi_id` = ?', [id]);
      await pool.query('DELETE FROM `materi_ajar` WHERE `id` = ?', [id]);
      invalidateCache('materi_ajar');
      invalidateCache('materi_objectives');
      globalEmitter.emit('update', { table: 'materi_ajar' });
    }
    res.json({ status: 'success' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get(['/api/sarpras', '/api/sarpras.php'], async (req, res) => {
  try {
    const rows = await getCachedTableData('sarpras');
    res.json(rows);
  } catch (error: any) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Failed to fetch sarpras data' });
  }
});

app.post(['/api/query', '/api/query.php'], async (req, res) => {
  try {
    const { query: sqlQuery } = req.body;
    if (typeof sqlQuery === 'string' && sqlQuery.trim()) {
      const [result]: any = await pool.query(sqlQuery);
      invalidateCache();
      globalEmitter.emit('update', { query: sqlQuery });
      return res.json({ status: 'success', result });
    }
    res.json({ status: 'success' });
  } catch (err: any) {
    console.error('query.php error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get(['/api/stats', '/api/stats.php'], async (req, res) => {
  try {
    const [users, students, classes] = await Promise.all([
      getCachedTableData('users'),
      getCachedTableData('students'),
      getCachedTableData('classes')
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

// Vite or Static file serving
async function initServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!process.env.VERCEL) {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT} with Realtime MySQL`);
    });
  }
}

initServer();

export default app;
