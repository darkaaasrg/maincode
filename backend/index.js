import express from "express";
import mysql from "mysql2";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import productController from "./api/productController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", productController);

app.use("/uploads", express.static("uploads"));

const db = mysql.createConnection({
  host: "26.210.121.124",
  user: "stasnya",
  password: "Aa20061095!",
  database: "music_catalog"
});

db.connect(err => {
  if (err) {
    console.error("Помилка підключення до MySQL:", err);
  } else {
    console.log("Підключено до MySQL");
  }
});

// 🔹 Всі касети
app.get("/api/cassettes", (req, res) => {
  db.query("SELECT * FROM Cassettes", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// 🔹 Всі вініли
app.get("/api/vinyls", (req, res) => {
  db.query("SELECT * FROM Vinyls", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ==================== ВІДГУКИ ==================== */

// 🔹 Отримати відгуки для конкретної касети
app.get("/api/cassettes/:id/reviews", (req, res) => {
  const cassetteId = req.params.id;
  db.query(
    "SELECT * FROM ReviewsCassettes WHERE cassette_id = ? ORDER BY date DESC",
    [cassetteId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// 🔹 Додати відгук для касети
app.post("/api/cassettes/:id/reviews", (req, res) => {
  const cassetteId = req.params.id;
  const { userId, rating, comment } = req.body;

  const sql = "INSERT INTO ReviewsCassettes (cassette_id, userId, rating, comment) VALUES (?, ?, ?, ?)";
  db.query(sql, [cassetteId, userId, rating, comment], (err) => {
    if (err) return res.status(500).json(err);

    // Повертаємо оновлений список відгуків
    db.query(
      "SELECT * FROM ReviewsCassettes WHERE cassette_id = ? ORDER BY date DESC",
      [cassetteId],
      (err2, results) => {
        if (err2) return res.status(500).json(err2);
        res.json(results);
      }
    );
  });
});

// 🔹 Отримати відгуки для конкретного вінiлу
app.get("/api/vinyls/:id/reviews", (req, res) => {
  const vinylId = req.params.id;
  db.query(
    "SELECT * FROM ReviewsVinyls WHERE vinyl_id = ? ORDER BY date DESC",
    [vinylId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// 🔹 Додати відгук для вінiлу
app.post("/api/vinyls/:id/reviews", (req, res) => {
  const vinylId = req.params.id;
  const { userId, rating, comment } = req.body;

  const sql = "INSERT INTO ReviewsVinyls (vinyl_id, userId, rating, comment) VALUES (?, ?, ?, ?)";
  db.query(sql, [vinylId, userId, rating, comment], (err) => {
    if (err) return res.status(500).json(err);

    db.query(
      "SELECT * FROM ReviewsVinyls WHERE vinyl_id = ? ORDER BY date DESC",
      [vinylId],
      (err2, results) => {
        if (err2) return res.status(500).json(err2);
        res.json(results);
      }
    );
  });
});

app.put("/api/reviews/:id", (req, res) => {
  const reviewId = req.params.id;
  const { rating, comment } = req.body;
  db.query(
    "UPDATE Reviews SET rating = ?, comment = ? WHERE ID = ?",
    [rating, comment, reviewId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Відгук оновлено" });
    }
  );
});

app.delete("/api/reviews/:id", (req, res) => {
  const reviewId = req.params.id;
  db.query("DELETE FROM Reviews WHERE ID = ?", [reviewId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Відгук видалено" });
  });
});


app.get("/", (req, res) => {
  res.send("API працює! Використовуй /vinyls або /cassettes");
});

app.listen(5000, () => {
  console.log("Сервер запущено на http://localhost:5000");
});
