// backend/api/productController.js (ВИПРАВЛЕНО)
import express from "express";
// ВИПРАВЛЕННЯ: Імпортуємо існуюче підключення 'db' з index.js
import { db } from "../index.js"; 

const router = express.Router();

// -----------------------------------------------------
// GET /health
// -----------------------------------------------------
router.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

/* ==================== КАСЕТИ ==================== */

// Отримати всі касети (GET /api/cassettes)
router.get("/cassettes", (req, res) => {
    // 💡 ВИПРАВЛЕНО: Залишаємо один коректний виклик db.query
    db.query("SELECT * FROM Cassettes", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Отримати касету за ID (GET /api/cassettes/:id)
router.get("/cassettes/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT * FROM Cassettes WHERE ID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0] || null);
    });
});

// Додати касету (POST /api/cassettes)
router.post("/cassettes", (req, res) => {
    const { Title, Artist, Genre, Published, Price, Country, Photo } = req.body;
    const sql = `
        INSERT INTO Cassettes (Title, Artist, Genre, Published, Price, Country, Photo)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [Title, Artist, Genre, Published, Price, Country, Photo], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ ID: result.insertId, message: "Касету додано" });
    });
});

// Редагувати касету (PUT /api/cassettes/:id)
router.put("/cassettes/:id", (req, res) => {
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

// Видалити касету (DELETE /api/cassettes/:id)
router.delete("/cassettes/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM Cassettes WHERE ID = ?", [id], (err) => {
        if (err) return res.status(500).json(err);
        res.status(204).send();
    });
});

/* ==================== ВІНІЛИ ==================== */

// Отримати всі вінілові диски (GET /api/vinyls)
router.get("/vinyls", (req, res) => {
    db.query("SELECT * FROM Vinyls", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Отримати вініл за ID (GET /api/vinyls/:id)
router.get("/vinyls/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT * FROM Vinyls WHERE ID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0] || null);
    });
});

// Додати вініл (POST /api/vinyls)
router.post("/vinyls", (req, res) => {
    const { Title, Artist, Genre, Published, Price, Country, Photo } = req.body;
    const sql = `
        INSERT INTO Vinyls (Title, Artist, Genre, Published, Price, Country, Photo)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [Title, Artist, Genre, Published, Price, Country, Photo], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ ID: result.insertId, message: "Вініл додано" });
    });
});

// Редагувати вініл (PUT /api/vinyls/:id)
router.put("/vinyls/:id", (req, res) => {
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

// Видалити вініл (DELETE /api/vinyls/:id)
router.delete("/vinyls/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM Vinyls WHERE ID = ?", [id], (err) => {
        if (err) return res.status(500).json(err);
        res.status(204).send();
    });
});

export default router;
