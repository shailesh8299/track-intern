// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import cors from "cors";
// import bcrypt from "bcryptjs";
// import pkg from "pg";
// const { Pool } = pkg;


// const app = express();
// app.use(cors());
// app.use(express.json());
// console.log({
//   user: process.env.PG_USER,
//   password: process.env.PG_PASSWORD,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   port: process.env.PG_PORT,
// });

// const pool = new Pool({
//   user: process.env.PG_USER,
//   password: process.env.PG_PASSWORD,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   port: process.env.PG_PORT,
// });

// // Signup endpoint
// app.post('/api/signup', async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await pool.query(
//       'INSERT INTO users (name, email, password, status) VALUES ($1, $2, $3, $4)',
//       [name, email, hashedPassword, 'pending']
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error('Signup error:', err); // <--- IMPORTANT for debugging
//     if (err.code === '23505') {
//       res.json({ success: false, message: 'Email already registered.' });
//     } else {
//       res.status(500).json({ success: false, message: 'Server error' });
//     }
//   }
// });

// // Login endpoint
// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     const user = result.rows[0];
//     if (user && (user.status === 'active' || user.role === 'admin') && await bcrypt.compare(password, user.password)) {
//       res.json({
//         success: true,
//         user: { id: user.id, name: user.name, email: user.email, role: user.role }
//       });
//     } else {
//       res.json({ success: false, message: 'Invalid email or password.' });
//     }
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Get pending users (for admin panel)
// app.get('/api/users/pending', async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT id, name, email, role, status, supervisor_id FROM users WHERE status = 'pending'"
//     );
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Approve user and assign role/supervisor
// app.post('/api/users/approve', async (req, res) => {
//   const { userId, role, supervisorId } = req.body;
//   try {
//     await pool.query(
//       "UPDATE users SET role = $1, status = 'active', supervisor_id = $2 WHERE id = $3",
//       [role, supervisorId || null, userId]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// });

// // Get all supervisors
// app.get('/api/users/supervisors', async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT id, name, email FROM users WHERE role = 'supervisor' AND status = 'active'"
//     );
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Get interns for a supervisor
// app.get('/api/users/interns/:supervisorId', async (req, res) => {
//   const { supervisorId } = req.params;
//   try {
//     const result = await pool.query(
//       "SELECT id, name, email FROM users WHERE role = 'intern' AND supervisor_id = $1 AND status = 'active'",
//       [supervisorId]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Get all users (for admin listing, optional)
// app.get('/api/users/all', async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT id, name, email, role, status, supervisor_id FROM users"
//     );
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Create task
// app.post('/api/tasks', async (req, res) => {
//   const { userId, date, task, hours, description } = req.body;
//   try {
//     const result = await pool.query(
//       "INSERT INTO tasks (user_id, date, task, hours, description) VALUES ($1, $2, $3, $4, $5) RETURNING *",
//       [userId, date, task, hours, description]
//     );
//     res.json({ success: true, task: result.rows[0] });
//   } catch (err) {
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// });

// // List tasks for a user
// app.get('/api/tasks/user/:userId', async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM tasks WHERE user_id = $1 ORDER BY date ASC",
//       [req.params.userId]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Update task
// app.put('/api/tasks/:id', async (req, res) => {
//   const { date, task, hours, description } = req.body;
//   try {
//     const result = await pool.query(
//       "UPDATE tasks SET date=$1, task=$2, hours=$3, description=$4 WHERE id=$5 RETURNING *",
//       [date, task, hours, description, req.params.id]
//     );
//     res.json({ success: true, task: result.rows[0] });
//   } catch (err) {
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// });

// // Delete task
// app.delete('/api/tasks/:id', async (req, res) => {
//   try {
//     await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`API running on port ${PORT}`));

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

console.log({
  database_url: process.env.DATABASE_URL,
  
});


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function ensureSchema() {
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(13)");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(100)");
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'");
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS review_comment TEXT");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      attendance_date DATE NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'present',
      note TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, attendance_date)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      from_date DATE NOT NULL,
      to_date DATE NOT NULL,
      reason TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      review_comment TEXT,
      reviewed_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(64) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    "CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash)"
  );
}

ensureSchema().catch((err) => {
  console.error("Failed to ensure schema:", err);
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalizedEmail) {
    return res.json({ success: true, message: "If an account exists, a reset link has been sent." });
  }

  try {
    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    const user = userResult.rows[0];

    if (!user) {
      return res.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    await pool.query(
      "UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE",
      [user.id]
    );

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
      [user.id, tokenHash, expiresAt]
    );

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendBaseUrl}/reset-password?token=${token}`;
    console.log("Password reset link:", resetLink);

    if (process.env.NODE_ENV !== "production") {
      return res.json({
        success: true,
        message: "If an account exists, a reset link has been sent.",
        resetLink,
      });
    }

    return res.json({ success: true, message: "If an account exists, a reset link has been sent." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const normalizedToken = typeof token === "string" ? token.trim() : "";
  const nextPassword = typeof password === "string" ? password : "";

  if (!normalizedToken || nextPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Invalid token or password" });
  }

  const tokenHash = crypto.createHash("sha256").update(normalizedToken).digest("hex");

  try {
    const tokenResult = await pool.query(
      `SELECT id, user_id, expires_at, used
       FROM password_resets
       WHERE token_hash = $1
       ORDER BY id DESC
       LIMIT 1`,
      [tokenHash]
    );

    const resetRow = tokenResult.rows[0];
    if (!resetRow || resetRow.used || new Date(resetRow.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: "Reset link is invalid or expired" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const hashedPassword = await bcrypt.hash(nextPassword, 10);

      await client.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, resetRow.user_id]);
      await client.query("UPDATE password_resets SET used = TRUE WHERE user_id = $1", [resetRow.user_id]);

      await client.query("COMMIT");
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }

    return res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, status) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, 'pending']
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Signup error:', err); // <--- IMPORTANT for debugging
    if (err.code === '23505') {
      res.json({ success: false, message: 'Email already registered.' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user && (user.status === 'active' || user.role === 'admin') && await bcrypt.compare(password, user.password)) {
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || "",
          position: user.position || "",
        }
      });
    } else {
      res.json({ success: false, message: 'Invalid email or password.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get pending users (for admin panel)
app.get('/api/users/pending', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, status, supervisor_id FROM users WHERE status = 'pending'"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Approve user and assign role/supervisor
app.post('/api/users/approve', async (req, res) => {
  const { userId, role, supervisorId } = req.body;
  try {
    await pool.query(
      "UPDATE users SET role = $1, status = 'active', supervisor_id = $2 WHERE id = $3",
      [role, supervisorId || null, userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Get all supervisors
app.get('/api/users/supervisors', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'supervisor' AND status = 'active'"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get interns for a supervisor
app.get('/api/users/interns/:supervisorId', async (req, res) => {
  const { supervisorId } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'intern' AND supervisor_id = $1 AND status = 'active'",
      [supervisorId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all users (for admin listing, optional)
app.get('/api/users/all', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, status, supervisor_id FROM users"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/api/users/:userId/profile', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, status, phone, position FROM users WHERE id = $1",
      [req.params.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const profile = result.rows[0];
    const normalizedPhone = (profile.phone || "").replace(/^\+91/, "");
    return res.json({ success: true, profile: { ...profile, phone: normalizedPhone } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put('/api/users/:userId/profile', async (req, res) => {
  const { name, email, phone, position } = req.body;
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
  const normalizedPosition = typeof position === "string" ? position.trim() : "";

  if (!normalizedName) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(normalizedEmail)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  if (!/^\d{10}$/.test(normalizedPhone)) {
    return res.status(400).json({ success: false, message: "Phone must be exactly 10 digits" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2, phone = $3, position = $4 WHERE id = $5 RETURNING id, name, email, role, status, phone, position",
      [normalizedName, normalizedEmail, normalizedPhone, normalizedPosition || null, req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create task
app.post('/api/tasks', async (req, res) => {
  const { userId, date, task, hours, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tasks (user_id, date, task, hours, description, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, date, task, hours, description, 'pending']
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// List tasks for a user
app.get('/api/tasks/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY date ASC",
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  const { date, task, hours, description } = req.body;
  try {
    const result = await pool.query(
      "UPDATE tasks SET date=$1, task=$2, hours=$3, description=$4, status='pending', review_comment=NULL WHERE id=$5 RETURNING *",
      [date, task, hours, description, req.params.id]
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.put('/api/tasks/:id/review', async (req, res) => {
  const { status, reviewComment } = req.body;
  const allowedStatus = ['pending', 'in-progress', 'completed', 'blocked'];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      "UPDATE tasks SET status=$1, review_comment=$2 WHERE id=$3 RETURNING *",
      [status, (reviewComment || '').trim() || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/attendance/mark', async (req, res) => {
  const { userId, date, status, note } = req.body;
  const normalizedStatus = (status || '').trim().toLowerCase();
  const allowedStatus = ['present', 'wfh', 'absent'];

  if (!userId || !date || !allowedStatus.includes(normalizedStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid attendance payload' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO attendance (user_id, attendance_date, status, note)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, attendance_date)
       DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note
       RETURNING *`,
      [userId, date, normalizedStatus, (note || '').trim() || null]
    );

    return res.json({ success: true, attendance: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/attendance/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM attendance WHERE user_id = $1 ORDER BY attendance_date DESC",
      [req.params.userId]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/attendance/supervisor/:supervisorId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.user_id, a.attendance_date, a.status, a.note, u.name, u.email
       FROM attendance a
       JOIN users u ON u.id = a.user_id
       WHERE u.role = 'intern' AND u.supervisor_id = $1
       ORDER BY a.attendance_date DESC`,
      [req.params.supervisorId]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/leaves', async (req, res) => {
  const { userId, fromDate, toDate, reason } = req.body;
  if (!userId || !fromDate || !toDate) {
    return res.status(400).json({ success: false, message: 'Missing required leave fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leave_requests (user_id, from_date, to_date, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, fromDate, toDate, (reason || '').trim() || null]
    );

    return res.json({ success: true, leave: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/leaves/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM leave_requests WHERE user_id = $1 ORDER BY created_at DESC",
      [req.params.userId]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/leaves/supervisor/:supervisorId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lr.*, u.name AS intern_name, u.email AS intern_email
       FROM leave_requests lr
       JOIN users u ON u.id = lr.user_id
       WHERE u.role = 'intern' AND u.supervisor_id = $1
       ORDER BY lr.created_at DESC`,
      [req.params.supervisorId]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/leaves/:id/review', async (req, res) => {
  const { status, reviewComment, reviewerId } = req.body;
  const normalizedStatus = (status || '').trim().toLowerCase();
  const allowed = ['approved', 'rejected', 'pending'];

  if (!allowed.includes(normalizedStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid leave status' });
  }

  try {
    const result = await pool.query(
      `UPDATE leave_requests
       SET status = $1, review_comment = $2, reviewed_by = $3
       WHERE id = $4
       RETURNING *`,
      [normalizedStatus, (reviewComment || '').trim() || null, reviewerId || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    return res.json({ success: true, leave: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/analytics/overview', async (_req, res) => {
  try {
    const [users, tasks, attendanceSummary, leaveSummary] = await Promise.all([
      pool.query(
        `SELECT
          COUNT(*)::int AS total_users,
          COUNT(*) FILTER (WHERE role = 'intern')::int AS interns,
          COUNT(*) FILTER (WHERE role = 'supervisor')::int AS supervisors,
          COUNT(*) FILTER (WHERE role = 'admin')::int AS admins,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_users,
          COUNT(*) FILTER (WHERE status = 'active')::int AS active_users
        FROM users`
      ),
      pool.query(
        `SELECT
          COUNT(*)::int AS total_tasks,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_tasks,
          COUNT(*) FILTER (WHERE status = 'in-progress')::int AS in_progress_tasks,
          COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_tasks,
          COUNT(*) FILTER (WHERE status = 'blocked')::int AS blocked_tasks,
          COALESCE(SUM(hours), 0)::int AS total_hours
        FROM tasks`
      ),
      pool.query(
        `SELECT
          COUNT(*)::int AS total_attendance,
          COUNT(*) FILTER (WHERE status = 'present')::int AS present_days,
          COUNT(*) FILTER (WHERE status = 'wfh')::int AS wfh_days,
          COUNT(*) FILTER (WHERE status = 'absent')::int AS absent_days
        FROM attendance`
      ),
      pool.query(
        `SELECT
          COUNT(*)::int AS total_leave_requests,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_leave_requests,
          COUNT(*) FILTER (WHERE status = 'approved')::int AS approved_leave_requests,
          COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_leave_requests
        FROM leave_requests`
      ),
    ]);

    const topInternHours = await pool.query(
      `SELECT u.name, u.email, COALESCE(SUM(t.hours), 0)::int AS hours
       FROM users u
       LEFT JOIN tasks t ON t.user_id = u.id
       WHERE u.role = 'intern'
       GROUP BY u.id, u.name, u.email
       ORDER BY hours DESC, u.name ASC
       LIMIT 5`
    );

    return res.json({
      success: true,
      overview: {
        users: users.rows[0],
        tasks: tasks.rows[0],
        attendance: attendanceSummary.rows[0],
        leaves: leaveSummary.rows[0],
        topInternHours: topInternHours.rows,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));