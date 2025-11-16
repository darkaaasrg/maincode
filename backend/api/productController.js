import express from "express";
import { db } from "../index.js";
import { authenticateToken, authorizeAdmin } from "../middleware/authMiddleware.js";
// === 1. ІМПОРТУЄМО НАШ MIDDLEWARE ДЛЯ ФАЙЛІВ ===
// (Ми створили його на попередньому кроці в /middleware/uploadMiddleware.js)
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @param {string} entityType 
 * @returns {object}
 */
// === 2. СПРОЩУЄМО createCrudHandlers ===
// Ми прибираємо 'create' та 'update', оскільки вони потребують
// спеціальної логіки для роботи з 'req.file' від multer.
const createCrudHandlers = (entityType) => {
    const table = entityType;
    const idField = 'ID'; 

    return {
        // getAll та getById залишаються без змін
        getAll: (req, res) => {
            db.query(`SELECT * FROM ${table}`, (err, results) => {
                if (err) return res.status(500).json({ error: "DBError", message: err.message });
                res.json(results);
            });
        },
        getById: (req, res) => {
            const id = req.params.id;
            db.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [id], (err, results) => {
                if (err) return res.status(500).json({ error: "DBError", message: err.message });
                res.json(results[0] || null);
            });
        },
        // delete залишається без змін
        delete: (req, res) => {
            const id = req.params.id;
            db.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [id], (err) => {
                if (err) return res.status(500).json({ error: "DBError", message: err.message });
                res.status(204).send();
            });
        }
    };
};

// Створюємо обробники (тепер тут тільки getAll, getById, delete)
const vinylHandlers = createCrudHandlers('Vinyls');
const cassetteHandlers = createCrudHandlers('Cassettes');

router.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// === 3. СПЕЦІАЛЬНІ ОБРОБНИКИ ДЛЯ СТВОРЕННЯ (з файлами) ===

const createVinyl = (req, res) => {
    // Текстові дані тепер у req.body
    const { Title, Artist, Genre, Published, Price, Country } = req.body;
    
    // Файл (завдяки multer) тепер у req.file
    if (!req.file) {
        return res.status(400).json({ message: 'Файл зображення (Photo) є обов\'язковим' });
    }
    // Беремо згенероване унікальне ім'я файлу
    const Photo = req.file.filename; 

    const sql = `
        INSERT INTO Vinyls (Title, Artist, Genre, Published, Price, Country, Photo)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [Title, Artist, Genre, Published, Price, Country, Photo], (err, result) => {
        if (err) return res.status(500).json({ error: "DBError", message: err.message });
        res.status(201).json({ ID: result.insertId, message: `Vinyls додано` });
    });
};

const createCassette = (req, res) => {
    const { Title, Artist, Genre, Published, Price, Country } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'Файл зображення (Photo) є обов\'язковим' });
    }
    const Photo = req.file.filename;
    const sql = `
        INSERT INTO Cassettes (Title, Artist, Genre, Published, Price, Country, Photo)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [Title, Artist, Genre, Published, Price, Country, Photo], (err, result) => {
        if (err) return res.status(500).json({ error: "DBError", message: err.message });
        res.status(201).json({ ID: result.insertId, message: `Cassettes додано` });
    });
};

// === 4. СПЕЦІАЛЬНІ ОБРОБНИКИ ДЛЯ ОНОВЛЕННЯ (з файлами) ===

const updateVinyl = (req, res) => {
    const id = req.params.id;
    const { Title, Artist, Genre, Published, Price, Country } = req.body;
    
    let sql;
    let params;

    if (req.file) {
        // ВИПАДОК 1: Користувач завантажив НОВЕ зображення
        const Photo = req.file.filename;
        sql = `
            UPDATE Vinyls
            SET Title = ?, Artist = ?, Genre = ?, Published = ?, Price = ?, Country = ?, Photo = ?
            WHERE ID = ?`;
        params = [Title, Artist, Genre, Published, Price, Country, Photo, id];
    } else {
        // ВИПАДОК 2: Користувач НЕ завантажив нове зображення (оновлюємо все, ОКРІМ Photo)
        sql = `
            UPDATE Vinyls
            SET Title = ?, Artist = ?, Genre = ?, Published = ?, Price = ?, Country = ?
            WHERE ID = ?`;
        params = [Title, Artist, Genre, Published, Price, Country, id];
    }

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: "DBError", message: err.message });
        res.json({ message: `Vinyls оновлено` });
    });
};

const updateCassette = (req, res) => {
    const id = req.params.id;
    const { Title, Artist, Genre, Published, Price, Country } = req.body;
    let sql;
    let params;

    if (req.file) {
        const Photo = req.file.filename;
        sql = `
            UPDATE Cassettes
            SET Title = ?, Artist = ?, Genre = ?, Published = ?, Price = ?, Country = ?, Photo = ?
            WHERE ID = ?`;
        params = [Title, Artist, Genre, Published, Price, Country, Photo, id];
    } else {
        sql = `
            UPDATE Cassettes
            SET Title = ?, Artist = ?, Genre = ?, Published = ?, Price = ?, Country = ?
            WHERE ID = ?`;
        params = [Title, Artist, Genre, Published, Price, Country, id];
    }

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: "DBError", message: err.message });
        res.json({ message: `Cassettes оновлено` });
    });
};


// =========================================================
// VINYLS ROUTES
// =========================================================
router.get("/vinyls", vinylHandlers.getAll);
router.get("/vinyls/:id", vinylHandlers.getById);
router.delete("/vinyls/:id", authenticateToken, authorizeAdmin, vinylHandlers.delete);

// === 5. ОНОВЛЕНІ РОУТИ POST/PUT ===
// Ми додаємо 'upload.single('Photo')' ДО authMiddleware і ДО обробника.
// 'Photo' - це 'name' поля <input type="file" name="Photo"> на фронтенді.
router.post("/vinyls", authenticateToken, authorizeAdmin, upload.single('Photo'), createVinyl);
router.put("/vinyls/:id", authenticateToken, authorizeAdmin, upload.single('Photo'), updateVinyl);


// =========================================================
// CASSETTES ROUTES
// =========================================================
router.get("/cassettes", cassetteHandlers.getAll);
router.get("/cassettes/:id", cassetteHandlers.getById);
router.delete("/cassettes/:id", authenticateToken, authorizeAdmin, cassetteHandlers.delete);

// === 5. ОНОВЛЕНІ РОУТИ POST/PUT ===
router.post("/cassettes", authenticateToken, authorizeAdmin, upload.single('Photo'), createCassette);
router.put("/cassettes/:id", authenticateToken, authorizeAdmin, upload.single('Photo'), updateCassette);

export default router;