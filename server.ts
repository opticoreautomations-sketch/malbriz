import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("restaurant.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    guests INTEGER NOT NULL,
    status TEXT DEFAULT 'pending'
  );
`);

// Seed data if empty
const menuCount = db.prepare("SELECT COUNT(*) as count FROM menu").get() as { count: number };
if (menuCount.count === 0) {
  const insert = db.prepare("INSERT INTO menu (name, category, price, description) VALUES (?, ?, ?, ?)");
  insert.run("Truffle Hummus", "Starters", "45 SAR", "Creamy chickpeas, black truffle oil, toasted pine nuts.");
  insert.run("Fusion Mezze", "Starters", "65 SAR", "A selection of traditional dips with a modern twist.");
  insert.run("Crispy Vine Leaves", "Starters", "55 SAR", "Stuffed with spiced rice, pomegranate molasses glaze.");
  insert.run("Lamb Kabsa Risotto", "Main Courses", "120 SAR", "Slow-cooked lamb, saffron risotto, crispy onions.");
  insert.run("Pistachio Sea Bass", "Main Courses", "145 SAR", "Crusted sea bass, lemon butter sauce, roasted asparagus.");
  insert.run("Wagyu Beef Sliders", "Main Courses", "95 SAR", "Mini wagyu patties, date jam, truffle mayo.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/menu", (req, res) => {
    const items = db.prepare("SELECT * FROM menu").all();
    res.json(items);
  });

  app.post("/api/menu", (req, res) => {
    const { name, category, price, description } = req.body;
    const info = db.prepare("INSERT INTO menu (name, category, price, description) VALUES (?, ?, ?, ?)").run(name, category, price, description);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/menu/:id", (req, res) => {
    db.prepare("DELETE FROM menu WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/reservations", (req, res) => {
    const items = db.prepare("SELECT * FROM reservations ORDER BY date DESC, time DESC").all();
    res.json(items);
  });

  app.post("/api/reservations", (req, res) => {
    const { name, email, date, time, guests } = req.body;
    const info = db.prepare("INSERT INTO reservations (name, email, date, time, guests) VALUES (?, ?, ?, ?, ?)").run(name, email, date, time, guests);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/reservations/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE reservations SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    const menuCount = db.prepare("SELECT COUNT(*) as count FROM menu").get() as { count: number };
    const resCount = db.prepare("SELECT COUNT(*) as count FROM reservations").get() as { count: number };
    const pendingRes = db.prepare("SELECT COUNT(*) as count FROM reservations WHERE status = 'pending'").get() as { count: number };
    res.json({
      totalMenuItems: menuCount.count,
      totalReservations: resCount.count,
      pendingReservations: pendingRes.count
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
