var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_promise = __toESM(require("mysql2/promise"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
import_dotenv.default.config();
var host = process.env.DB_HOST || "localhost";
var port = parseInt(process.env.DB_PORT || "3306");
if (host.includes(":")) {
  const parts = host.split(":");
  host = parts[0];
  if (parts[1]) {
    const parsedPort = parseInt(parts[1], 10);
    if (!isNaN(parsedPort)) {
      port = parsedPort;
    }
  }
}
var dbConfig = {
  host,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "test",
  port
};
var pool;
try {
  if (process.env.DB_HOST) {
    pool = import_promise.default.createPool(dbConfig);
    console.log("Database pool initialized with host:", process.env.DB_HOST);
  } else {
    console.log("No DB_HOST provided, skipping database initialization.");
  }
} catch (error) {
  console.error("Failed to initialize database pool:", error);
}
async function ensureDatabaseColumns() {
  if (pool) {
    try {
      const [columnsNuptk] = await pool.query("SHOW COLUMNS FROM users LIKE 'nuptk'");
      if (columnsNuptk.length === 0) {
        console.log("Adding 'nuptk' column to 'users' table...");
        await pool.query("ALTER TABLE users ADD COLUMN nuptk VARCHAR(50) DEFAULT NULL");
        console.log("'nuptk' column added successfully.");
      }
      const [columnsRoles] = await pool.query("SHOW COLUMNS FROM users LIKE 'roles'");
      if (columnsRoles.length === 0) {
        console.log("Adding 'roles' column to 'users' table...");
        await pool.query("ALTER TABLE users ADD COLUMN roles JSON DEFAULT NULL");
        console.log("'roles' column added successfully.");
      }
    } catch (err) {
      console.error("Failed to ensure database columns exist:", err);
    }
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  await ensureDatabaseColumns();
  const allowedTables = [
    "academic_history",
    "academic_terms",
    "agenda",
    "announcements",
    "bk_cases",
    "cbt_exams",
    "cbt_questions",
    "cbt_submissions",
    "classes",
    "grades",
    "kinerja_staf",
    "leave_requests",
    "materi_ajar",
    "materi_objectives",
    "notifications",
    "sarpras",
    "schedules",
    "student_attendance",
    "students",
    "subjects",
    "teacher_attendance",
    "teaching_assignments",
    "users"
  ];
  app.all("/api/crud.php", (req, res, next) => {
    const table = req.query.table;
    const id = req.query.id;
    if (!table) return res.status(400).json({ error: "Missing table param" });
    if (id) {
      req.url = `/api/crud/${table}/${id}`;
    } else {
      req.url = `/api/crud/${table}`;
    }
    next();
  });
  const dbFallback = {
    subjects: [
      { id: 1, code: "MP-001", name: "Matematika", category: "Wajib", weekly_hours: 4 },
      { id: 2, code: "MP-002", name: "Bahasa Indonesia", category: "Wajib", weekly_hours: 4 }
    ],
    sarpras: [
      { id: 1, item_name: "Proyektor EPSON", code: "PRJ-001", category: "Peralatan Elektronik", quantity: 2, qty_baik: 1, qty_rusak_ringan: 1, qty_rusak_berat: 0, condition: "Baik", room: "Ruang Guru" }
    ],
    users: [],
    students: [],
    classes: []
  };
  app.get("/api/crud/:table", async (req, res) => {
    const { table } = req.params;
    if (!allowedTables.includes(table)) return res.status(403).json({ error: "Forbidden table" });
    if (!pool) {
      return res.json(dbFallback[table] || []);
    }
    try {
      const [rows] = await pool.query(`SELECT * FROM ${table}`);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/crud/:table", async (req, res) => {
    const { table } = req.params;
    if (!allowedTables.includes(table)) return res.status(403).json({ error: "Forbidden table" });
    if (!pool) {
      const data = req.body;
      if (!dbFallback[table]) dbFallback[table] = [];
      const id = dbFallback[table].length > 0 ? Math.max(...dbFallback[table].map((x) => x.id)) + 1 : 1;
      const newItem = { ...data, id };
      dbFallback[table].push(newItem);
      return res.json({ insertId: id });
    }
    try {
      const data = req.body;
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => "?").join(", ");
      const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
      const [result] = await pool.query(sql, values);
      res.json({ insertId: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/crud/:table/:id", async (req, res) => {
    const { table, id } = req.params;
    if (!allowedTables.includes(table)) return res.status(403).json({ error: "Forbidden table" });
    if (!pool) {
      if (!dbFallback[table]) return res.json({ affectedRows: 0 });
      const idx = dbFallback[table].findIndex((x) => x.id == id);
      if (idx >= 0) {
        dbFallback[table][idx] = { ...dbFallback[table][idx], ...req.body };
        return res.json({ affectedRows: 1 });
      }
      return res.json({ affectedRows: 0 });
    }
    try {
      const data = req.body;
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((k) => `${k} = ?`).join(", ");
      const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
      const [result] = await pool.query(sql, [...values, id]);
      res.json({ affectedRows: result.affectedRows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/crud/:table/:id", async (req, res) => {
    const { table, id } = req.params;
    if (!allowedTables.includes(table)) return res.status(403).json({ error: "Forbidden table" });
    if (!pool) {
      if (!dbFallback[table]) return res.json({ affectedRows: 0 });
      const idx = dbFallback[table].findIndex((x) => x.id == id);
      if (idx >= 0) {
        dbFallback[table].splice(idx, 1);
        return res.json({ affectedRows: 1 });
      }
      return res.json({ affectedRows: 0 });
    }
    try {
      const sql = `DELETE FROM ${table} WHERE id = ?`;
      const [result] = await pool.query(sql, [id]);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get(["/api/announcements", "/api/announcements.php"], async (req, res) => {
    if (!pool) {
      return res.json([
        { id: 1, title: "Selamat Datang", content: "Selamat datang di Siakad. Harap perbarui data profil Anda.", target_audience: "semua", created_at: (/* @__PURE__ */ new Date()).toISOString() }
      ]);
    }
    try {
      const [rows] = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC");
      res.json(rows);
    } catch (error) {
      console.error("Database query error:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });
  app.post("/api/login.php", async (req, res) => {
    const { username, password } = req.body;
    if (!pool) {
      if (username === "admin" && password === "12345") {
        return res.json({ status: "success", user: { id: 1, username: "admin", role: "admin", name: "Administrator" } });
      }
      const usersList = dbFallback["users"] || [];
      const foundUser = usersList.find(
        (u) => u.username && u.username.toLowerCase() === username.toLowerCase() || u.nuptk && u.nuptk.toLowerCase() === username.toLowerCase()
      );
      if (foundUser) {
        let isPasswordCorrect = false;
        try {
          if (foundUser.password && (foundUser.password.startsWith("$2a$") || foundUser.password.startsWith("$2b$"))) {
            isPasswordCorrect = import_bcryptjs.default.compareSync(password, foundUser.password);
          } else {
            isPasswordCorrect = foundUser.password === password;
          }
        } catch (e) {
          isPasswordCorrect = foundUser.password === password;
        }
        if (isPasswordCorrect) {
          return res.json({ status: "success", user: foundUser });
        }
      }
      return res.json({ status: "error", message: "Username / NIPTK atau password salah" });
    }
    try {
      const [users] = await pool.query("SELECT * FROM users WHERE username = ? OR nuptk = ?", [username, username]);
      const userList = users;
      if (userList.length > 0) {
        const dbUser = userList[0];
        let isPasswordCorrect = false;
        try {
          if (dbUser.password && (dbUser.password.startsWith("$2a$") || dbUser.password.startsWith("$2b$"))) {
            isPasswordCorrect = import_bcryptjs.default.compareSync(password, dbUser.password);
          } else {
            isPasswordCorrect = dbUser.password === password;
          }
        } catch (bcryptErr) {
          isPasswordCorrect = dbUser.password === password;
        }
        if (isPasswordCorrect) {
          return res.json({ status: "success", user: dbUser });
        }
      }
      return res.json({ status: "error", message: "Username / NIPTK atau password salah" });
    } catch (err) {
      return res.json({ status: "error", message: err.message });
    }
  });
  app.get("/api/get_user.php", async (req, res) => {
    const { id } = req.query;
    if (!pool) {
      return res.json({ status: "success", user: { id, name: "Mock User", avatar: "" } });
    }
    try {
      const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
      const userList = users;
      if (userList.length > 0) {
        return res.json({ status: "success", user: userList[0] });
      }
      return res.json({ status: "error", message: "User not found" });
    } catch (err) {
      return res.json({ status: "error", message: err.message });
    }
  });
  app.post("/api/update_avatar.php", async (req, res) => {
    const { user_id, avatar_base64 } = req.body;
    if (!pool) {
      return res.json({ status: "success", avatar_url: avatar_base64 });
    }
    try {
      await pool.query("UPDATE users SET avatar = ? WHERE id = ?", [avatar_base64, user_id]);
      return res.json({ status: "success", avatar_url: avatar_base64 });
    } catch (err) {
      return res.json({ status: "error", message: err.message });
    }
  });
  app.post(["/api/request_reset", "/api/request_reset.php"], async (req, res) => {
    const { username } = req.body;
    if (!pool) return res.json({ status: "success" });
    try {
      const [users] = await pool.query("SELECT * FROM users WHERE username = ? OR id = ?", [username, username]);
      const userList = users;
      if (userList.length > 0) {
        const u = userList[0];
        const title = "Permintaan Reset Password";
        const message = `Pengguna ${u.name} (${u.username}) meminta reset password.`;
        const type = "warning";
        await pool.query(
          "INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())",
          [1, title, message, type]
        );
      }
      return res.json({ status: "success" });
    } catch (err) {
      console.error(err);
      return res.json({ status: "error", message: err.message });
    }
  });
  app.all("/api/notifications.php", (req, res, next) => {
    const userId = req.query.user_id;
    if (userId) {
      req.url = `/api/notifications/${userId}`;
    }
    next();
  });
  app.all("/api/notifications_read.php", (req, res, next) => {
    const id = req.query.id;
    if (id) {
      req.url = `/api/notifications/${id}/read`;
    }
    next();
  });
  app.get("/api/notifications/:user_id", async (req, res) => {
    const { user_id } = req.params;
    if (!pool) return res.json([]);
    try {
      const [rows] = await pool.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [user_id]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/notifications/:id/read", async (req, res) => {
    const { id } = req.params;
    if (!pool) return res.json({ status: "success" });
    try {
      await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
      res.json({ status: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/sync.php", async (req, res) => {
    if (!pool) {
      return res.json({
        users: dbFallback["users"] || [],
        students: dbFallback["students"] || [],
        classes: dbFallback["classes"] || [],
        subjects: dbFallback["subjects"] || []
      });
    }
    try {
      const [users] = await pool.query("SELECT * FROM users");
      const [students] = await pool.query("SELECT * FROM students");
      const [classes] = await pool.query("SELECT * FROM classes");
      const [subjects] = await pool.query("SELECT * FROM subjects");
      res.json({ users, students, classes, subjects });
    } catch (error) {
      console.error("Database query error:", error);
      res.status(500).json({ error: "Failed to sync data" });
    }
  });
  app.get(["/api/get_materi", "/api/get_materi.php"], async (req, res) => {
    if (!pool) return res.json({ status: "success", data: [] });
    try {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.query(`
          SELECT m.*, u.name, u.role, m.class_name as class
          FROM materi_ajar m 
          LEFT JOIN users u ON m.user_id = u.id 
          ORDER BY m.created_at DESC
        `);
        for (let row of rows) {
          const [objs] = await db.query("SELECT objective FROM materi_objectives WHERE materi_id = ?", [row.id]);
          row.objectives = objs.map((o) => o.objective);
        }
        res.json({ status: "success", data: rows });
      } finally {
        db.release();
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post(["/api/save_materi", "/api/save_materi.php"], async (req, res) => {
    if (!pool) return res.json({ status: "success", id: 1 });
    try {
      const db = await pool.getConnection();
      try {
        const { id, user_id, subject, class_name, title, description, file_name, status, date, objectives } = req.body;
        await db.beginTransaction();
        let materiId = id;
        if (id) {
          await db.query(`
            UPDATE materi_ajar SET 
              subject = ?, class_name = ?, title = ?, description = ?, 
              file_name = ?, status = ?, date = ?
            WHERE id = ?
          `, [subject, class_name, title, description, file_name, status, date, id]);
          await db.query("DELETE FROM materi_objectives WHERE materi_id = ?", [id]);
        } else {
          const [result] = await db.query(`
            INSERT INTO materi_ajar (user_id, subject, class_name, title, description, file_name, status, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [user_id, subject, class_name, title, description, file_name, status, date]);
          materiId = result.insertId;
        }
        if (objectives && objectives.length > 0) {
          for (const obj of objectives) {
            await db.query("INSERT INTO materi_objectives (materi_id, objective) VALUES (?, ?)", [materiId, obj]);
          }
        }
        await db.commit();
        res.json({ status: "success", id: materiId });
      } catch (err) {
        await db.rollback();
        throw err;
      } finally {
        db.release();
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  app.post(["/api/delete_materi", "/api/delete_materi.php"], async (req, res) => {
    if (!pool) return res.json({ status: "success" });
    try {
      const { id } = req.body;
      const db = await pool.getConnection();
      try {
        await db.beginTransaction();
        await db.query("DELETE FROM materi_objectives WHERE materi_id = ?", [id]);
        await db.query("DELETE FROM materi_ajar WHERE id = ?", [id]);
        await db.commit();
        res.json({ status: "success" });
      } catch (err) {
        await db.rollback();
        throw err;
      } finally {
        db.release();
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  app.get(["/api/sarpras", "/api/sarpras.php"], async (req, res) => {
    if (!pool) {
      return res.json(dbFallback["sarpras"] || []);
    }
    try {
      const [rows] = await pool.query("SELECT * FROM sarpras");
      res.json(rows);
    } catch (error) {
      console.error("Database query error:", error);
      res.status(500).json({ error: "Failed to fetch sarpras data" });
    }
  });
  app.get(["/api/stats", "/api/stats.php"], async (req, res) => {
    if (!pool) {
      return res.json({
        totalUsers: 15,
        totalStudents: 120,
        activeClasses: 6,
        attendanceRate: 98,
        users: 15,
        students: 120,
        classes: 6
      });
    }
    try {
      res.json({
        users: 150,
        students: 450,
        classes: 12
      });
    } catch (error) {
      console.error("Database query error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
