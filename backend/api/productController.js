import express from "express";
import { db } from "../index.js";
import { authenticateToken, authorizeAdmin } from "../middleware/authMiddleware.js";
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @param {string} entityType 
 * @returns {object}
 */
const createCrudHandlers = (entityType) => {
    const table = entityType;
    const idField = 'ID'; 

    return {
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
        delete: (req, res) => {
            const id = req.params.id;
            db.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [id], (err) => {
                if (err) return res.status(500).json({ error: "DBError", message: err.message });
                res.status(204).send();
            });
        }
    };
};

const vinylHandlers = createCrudHandlers('vinyls');
const cassetteHandlers = createCrudHandlers('cassettes');

router.get("/health", (req, res) => {
    res.json({ status: "ok" });
});


const createvinyl = (req, res) => {
    const { Title, Artist, Genre, Published, Price, Country } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: 'Файл зображення (Photo) є обов\'язковим' });
    }
    const Photo = req.file.filename; 

    const sql = `
        INSERT INTO vinyls (Title, Artist, Genre, Published, Price, Country, Photo)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [Title, Artist, Genre, Published, Price, Country, Photo], (err, result) => {
        if (err) return res.status(500).json({ error: "DBError", message: err.message });
        res.status(201).json({ ID: result.insertId, message: `Vinyls додано` });
    });
};

const createcassette = (req, res) => {
    const { Title, Artist, Genre, Published, Price, Country } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'Файл зображення (Photo) є обов\'язковим' });
    }
    const Photo = req.file.filename;
    const sql = `
        INSERT INTO cassettes (Title, Artist, Genre, Published, Price, Country, Photo)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [Title, Artist, Genre, Published, Price, Country, Photo], (err, result) => {
        if (err) return res.status(500).json({ error: "DBError", message: err.message });
        res.status(201).json({ ID: result.insertId, message: `Cassettes додано` });
    });
};


const updatevinyl = (req, res) => {
    const id = req.params.id;
    const { Title, Artist, Genre, Published, Price, Country } = req.body;
    
    let sql;
    let params;

    if (req.file) {
        const Photo = req.file.filename;
        sql = `
            UPDATE vinyls
            SET Title = ?, Artist = ?, Genre = ?, Published = ?, Price = ?, Country = ?, Photo = ?
            WHERE ID = ?`;
        params = [Title, Artist, Genre, Published, Price, Country, Photo, id];
    } else {
        sql = `
            UPDATE vinyls
            SET Title = ?, Artist = ?, Genre = ?, Published = ?, Price = ?, Country = ?
            WHERE ID = ?`;
        params = [Title, Artist, Genre, Published, Price, Country, id];
    }

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: "DBError", message: err.message });
        res.json({ message: `Vinyls оновлено` });
    });
};

const updatecassette = (req, res) => {
    const id = req.params.id;
    const { Title, Artist, Genre, Published, Price, Country } = req.body;
    let sql;
    let params;

    if (req.file) {
        const Photo = req.file.filename;
        sql = `
            UPDATE cassettes
            SET Title = ?, Artist = ?, Genre = ?, Published = ?, Price = ?, Country = ?, Photo = ?
            WHERE ID = ?`;
        params = [Title, Artist, Genre, Published, Price, Country, Photo, id];
    } else {
        sql = `
            UPDATE cassettes
            SET Title = ?, Artist = ?, Genre = ?, Published = ?, Price = ?, Country = ?
            WHERE ID = ?`;
        params = [Title, Artist, Genre, Published, Price, Country, id];
    }

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: "DBError", message: err.message });
        res.json({ message: `Cassettes оновлено` });
    });
};
router.get("/products/random", async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const halfLimit = Math.ceil(limit / 2);

    try {
        const [vinyls] = await db.promise().query(
            `SELECT ID, Title, Artist, Price, Photo, 'vinyl' as type FROM vinyls ORDER BY RAND() LIMIT ?`, 
            [halfLimit]
        );

        const [cassettes] = await db.promise().query(
            `SELECT ID, Title, Artist, Price, Photo, 'cassette' as type FROM cassettes ORDER BY RAND() LIMIT ?`, 
            [halfLimit]
        );

        const mixed = [...vinyls, ...cassettes].sort(() => 0.5 - Math.random());

        res.json(mixed);
    } catch (err) {
        console.error("Помилка отримання random товарів:", err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});
router.get("/search", (req, res) => {
    const { q, genre, minPrice, maxPrice, country } = req.query;

    const searchQuery = q ? `%${q}%` : '%';
    const genreQuery = genre ? `%${genre}%` : '%';
    const countryQuery = country ? `%${country}%` : '%';
    const minP = minPrice ? parseFloat(minPrice) : 0;
    const maxP = maxPrice ? parseFloat(maxPrice) : 9999999;

    const sql = `
        SELECT ID, Title, Artist, Genre, Published, Price, Country, Photo, 'vinyl' as type 
        FROM vinyls 
        WHERE (Title LIKE ? OR Artist LIKE ?) 
          AND Genre LIKE ? 
          AND Country LIKE ?
          AND Price BETWEEN ? AND ?
        UNION ALL
        SELECT ID, Title, Artist, Genre, Published, Price, Country, Photo, 'cassette' as type 
        FROM cassettes 
        WHERE (Title LIKE ? OR Artist LIKE ?) 
          AND Genre LIKE ? 
          AND Country LIKE ?
          AND Price BETWEEN ? AND ?
    `;

    const params = [
        searchQuery, searchQuery, genreQuery, countryQuery, minP, maxP,
        searchQuery, searchQuery, genreQuery, countryQuery, minP, maxP
    ];

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Search error:", err);
            return res.status(500).json({ error: "DBError", message: err.message });
        }
        res.json(results);
    });
});

router.get("/vinyls", vinylHandlers.getAll);
router.get("/vinyls/:id", vinylHandlers.getById);
router.delete("/vinyls/:id", authenticateToken, authorizeAdmin, vinylHandlers.delete);

router.post("/vinyls", authenticateToken, authorizeAdmin, upload.single('Photo'), createvinyl);
router.put("/vinyls/:id", authenticateToken, authorizeAdmin, upload.single('Photo'), updatevinyl);


router.get("/cassettes", cassetteHandlers.getAll);
router.get("/cassettes/:id", cassetteHandlers.getById);
router.delete("/cassettes/:id", authenticateToken, authorizeAdmin, cassetteHandlers.delete);

router.post("/cassettes", authenticateToken, authorizeAdmin, upload.single('Photo'), createcassette);
router.put("/cassettes/:id", authenticateToken, authorizeAdmin, upload.single('Photo'), updatecassette);

export default router;