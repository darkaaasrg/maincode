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

/* ==================== КАСЕТИ ==================== */

// Отримати всі касети
app.get("/api/cassettes", (req, res) => {
  db.query("SELECT * FROM Cassettes", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Отримати касету за ID
app.get("/api/cassettes/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM Cassettes WHERE ID = ?", [id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0] || null);
  });
});

// Додати касету
app.post("/api/cassettes", (req, res) => {
  const { Title, Artist, Genre, Published, Price, Country, Photo } = req.body;
  const sql = `
    INSERT INTO Cassettes (Title, Artist, Genre, Published, Price, Country, Photo)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [Title, Artist, Genre, Published, Price, Country, Photo], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ ID: result.insertId, message: "Касету додано" });
  });
});

// Редагувати касету
app.put("/api/cassettes/:id", (req, res) => {
  const id = req.params.id;
  const { Title, Artist, Genre, Published, Price, Country, Photo } = req.body;
  const sql = `
    UPDATE Cassettes
    SET Title = ?, Artist = ?, Genre = ?, Published = ?, Price = ?, Country = ?, Photo = ?
    WHERE ID = ?`;
  db.query(sql, [Title, Artist, Genre, Published, Price, Country, Photo, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Касету оновлено" });
  });
});

// Видалити касету
app.delete("/api/cassettes/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM Cassettes WHERE ID = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Касету видалено" });
  });
});

/* ==================== ВІНІЛИ ==================== */

// Отримати всі вінілові диски
app.get("/api/vinyls", (req, res) => {
  db.query("SELECT * FROM Vinyls", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Отримати вініл за ID
app.get("/api/vinyls/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM Vinyls WHERE ID = ?", [id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0] || null);
  });
});

// Додати вініл
app.post("/api/vinyls", (req, res) => {
  const { Title, Artist, Genre, Published, Price, Country, Photo } = req.body;
  const sql = `
    INSERT INTO Vinyls (Title, Artist, Genre, Published, Price, Country, Photo)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [Title, Artist, Genre, Published, Price, Country, Photo], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ ID: result.insertId, message: "Вініл додано" });
  });
});

// Редагувати вініл
app.put("/api/vinyls/:id", (req, res) => {
  const id = req.params.id;
  const { Title, Artist, Genre, Published, Price, Country, Photo } = req.body;
  const sql = `
    UPDATE Vinyls
    SET Title = ?, Artist = ?, Genre = ?, Published = ?, Price = ?, Country = ?, Photo = ?
    WHERE ID = ?`;
  db.query(sql, [Title, Artist, Genre, Published, Price, Country, Photo, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Вініл оновлено" });
  });
});

// Видалити вініл
app.delete("/api/vinyls/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM Vinyls WHERE ID = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Вініл видалено" });
  });
});

/* ==================== ВІДГУКИ КАСЕТ ==================== */

// Отримати відгуки касети
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

// Додати відгук касети
app.post("/api/cassettes/:id/reviews", (req, res) => {
  const cassetteId = req.params.id;
  const { userId, rating, comment } = req.body;

  const sql = `
    INSERT INTO ReviewsCassettes (cassette_id, userId, rating, comment, date)
    VALUES (?, ?, ?, ?, NOW())`;
  db.query(sql, [cassetteId, userId, rating, comment], (err) => {
    if (err) return res.status(500).json(err);

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

/* ==================== ВІДГУКИ ВІНІЛИ (НОВЕ) ==================== */

// Отримати відгуки вінілу
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

// Додати відгук вінілу
app.post("/api/vinyls/:id/reviews", (req, res) => {
  const vinylId = req.params.id;
  const { userId, rating, comment } = req.body;

  const sql = `
    INSERT INTO ReviewsVinyls (vinyl_id, userId, rating, comment, date)
    VALUES (?, ?, ?, ?, NOW())`;
  db.query(sql, [vinylId, userId, rating, comment], (err) => {
    if (err) return res.status(500).json(err);

    // Повертаємо оновлений список відгуків
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

/* ==================== РЕДАГУВАННЯ/ВИДАЛЕННЯ ЗАГАЛЬНИХ ВІДГУКІВ ==================== */
// Примітка: ці ендпоїнти використовують загальний маршрут '/api/reviews/:id',
// тому припускаємо, що таблиця відгуків має унікальні ID, і запити UPDATE/DELETE
// будуть застосовуватися до потрібної таблиці (Cassettes або Vinyls) залежно від контексту.
// Якщо ви використовуєте *дві* різні таблиці для відгуків (ReviewsCassettes та ReviewsVinyls),
// вам потрібно буде зробити ці ендпоїнти більш специфічними або використати узагальнену таблицю.
// Наразі я коригую їх, щоб вони використовували *обидві* таблиці для PUT/DELETE.

// Редагувати відгук
app.put("/api/reviews/:id", (req, res) => {
  const reviewId = req.params.id;
  const { rating, comment } = req.body;
  const sqlUpdate = "UPDATE ReviewsCassettes SET rating = ?, comment = ? WHERE ID = ?";
  
  // Спробуємо оновити в таблиці касет
  db.query(sqlUpdate, [rating, comment, reviewId], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      // Якщо не оновлено, спробуємо оновити в таблиці вінілів
      const sqlUpdateVinyl = "UPDATE ReviewsVinyls SET rating = ?, comment = ? WHERE ID = ?";
      db.query(sqlUpdateVinyl, [rating, comment, reviewId], (errVinyl) => {
        if (errVinyl) return res.status(500).json(errVinyl);
        res.json({ message: "Відгук оновлено" });
      });
    } else {
      res.json({ message: "Відгук оновлено" });
    }
  });
});

app.delete("/api/reviews/:id", (req, res) => {
  const reviewId = req.params.id;
  const sqlDelete = "DELETE FROM ReviewsCassettes WHERE ID = ?";
  
  // Спробуємо видалити з таблиці касет
  db.query(sqlDelete, [reviewId], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      // Якщо не видалено, спробуємо видалити з таблиці вінілів
      const sqlDeleteVinyl = "DELETE FROM ReviewsVinyls WHERE ID = ?";
      db.query(sqlDeleteVinyl, [reviewId], (errVinyl) => {
        if (errVinyl) return res.status(500).json(errVinyl);
        res.json({ message: "Відгук видалено" });
      });
    } else {
      res.json({ message: "Відгук видалено" });
    }
  });
});

app.get("/", (req, res) => {
  res.send("API працює! Використовуй /vinyls або /cassettes");
});

app.listen(5000, () => {
  console.log("Сервер запущено на http://localhost:5000");
});