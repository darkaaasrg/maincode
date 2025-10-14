import express from "express";
import { db } from "../index.js";
const router = express.Router();

const handleNotFound = (res) => {
    res.status(404).json({ error: "NotFound", code: "REVIEW_NOT_FOUND", details: [] });
};

const validateReview = (data) => {
    const textContent = data.text || data.comment; 
    const { user, productType, productId } = data;
    
    if (!user || !productType || !productId || !textContent || textContent.length < 3) {
        return {
            error: "ValidationError",
            code: "EMPTY_REVIEW_OR_MISSING_FIELD",
            details: [{ field: "comment", message: "Review comment must be at least 3 characters and all fields are required." }]
        };
    }
    return null;
};

router.get("/reviews", (req, res) => {
    // Отримуємо параметри з URL: ?productType=...&productId=...
    const { productType, productId } = req.query;

    // ПЕРЕВІРКА: Якщо параметри для фільтрації передані
    if (productType && productId) {
        // Визначаємо, з якою таблицею та полем працювати
        const tableName = productType === 'vinyl' ? "ReviewsVinyls" : "ReviewsCassettes";
        const productField = productType === 'vinyl' ? "vinyl_id" : "cassette_id";
        
        // Створюємо SQL-запит з умовою WHERE для фільтрації
        const sql = `
            SELECT ID, userId, rating, comment, date, '${productType}' as product_type, ${productField} as productId 
            FROM ${tableName} 
            WHERE ${productField} = ?`;

        // Виконуємо запит з ID товару
        db.query(sql, [productId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "DBError", message: "Query failed: " + err.message });
            }
            // Повертаємо тільки відфільтровані відгуки
            res.status(200).json(results);
        });

    } else {
        // ЯКЩО ПАРАМЕТРИ НЕ ПЕРЕДАНІ: залишаємо стару логіку (завантажити всі)
        // Це корисно для адмін-панелі або інших випадків
        const sqlCassettes = "SELECT ID, userId, rating, comment, date, 'cassette' as product_type, cassette_id as productId FROM ReviewsCassettes";
        const sqlVinyls = "SELECT ID, userId, rating, comment, date, 'vinyl' as product_type, vinyl_id as productId FROM ReviewsVinyls";
        
        db.query(sqlCassettes, (err, cassResults) => {
            if (err) return res.status(500).json({ error: "DBError", message: "Cassettes query failed: " + err.message });
            
            db.query(sqlVinyls, (err2, vinylResults) => {
                if (err2) return res.status(500).json({ error: "DBError", message: "Vinyls query failed: " + err2.message });
                res.status(200).json([...cassResults, ...vinylResults]);
            });
        });
    }
});

router.post("/reviews", (req, res) => {
    const validationError = validateReview(req.body);
    if (validationError) {
        return res.status(400).json(validationError);
    }
    
    const { user, productType, productId, text, comment, rating } = req.body;
    const finalComment = text || comment;
    
    const tableName = productType === 'vinyl' ? "ReviewsVinyls" : "ReviewsCassettes";
    const productField = productType === 'vinyl' ? "vinyl_id" : "cassette_id";
    
    const sql = `
    INSERT INTO ${tableName} (${productField}, userId, rating, comment, date, productType)
    VALUES (?, ?, ?, ?, NOW(), ?)`; // <--- Додали ще один '?'

    db.query(sql, [productId, user, rating || 5, finalComment, productType], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DBError", message: err.message });
        }
        
        res.status(201).json({
            ID: result.insertId,
            userId: user, 
            rating: rating || 5, 
            comment: finalComment, 
            date: new Date().toISOString(),
            product_type: productType,
            productId: productId
        });
    });
});

router.put("/reviews/:id", (req, res) => {
    const reviewId = req.params.id;
    const { rating, comment } = req.body; 
    if (rating === undefined && comment === undefined) {
         return res.status(400).json({ error: "BadRequest", message: "No data provided for update." });
    }

    const sqlUpdateCassette = "UPDATE ReviewsCassettes SET rating = ?, comment = ? WHERE ID = ?";
    const sqlUpdateVinyl = "UPDATE ReviewsVinyls SET rating = ?, comment = ? WHERE ID = ?";
    
    const updateReview = (sql) => {
        return new Promise((resolve, reject) => {
             db.query(sql, [rating, comment, reviewId], (err, result) => {
                if (err) return reject(err);
                resolve(result.affectedRows);
            });
        });
    };

    updateReview(sqlUpdateCassette)
        .then(affectedRows => {
            if (affectedRows > 0) return res.status(200).json({ message: "Відгук оновлено" });
            return updateReview(sqlUpdateVinyl);
        })
        .then(affectedRows => {
            if (affectedRows > 0) return res.status(200).json({ message: "Відгук оновлено" });
            if (!res.headersSent) handleNotFound(res);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "DBError", message: "Update failed: " + err.message });
        });
});
router.delete("/reviews/:id", (req, res) => {
    const reviewId = req.params.id;
    
    const sqlDelete = "DELETE FROM ReviewsCassettes WHERE ID = ?";
    const sqlDeleteVinyl = "DELETE FROM ReviewsVinyls WHERE ID = ?";

    const deleteReview = (sql) => {
        return new Promise((resolve, reject) => {
            db.query(sql, [reviewId], (err, result) => {
                if (err) return reject(err);
                resolve(result.affectedRows);
            });
        });
    };
    
    deleteReview(sqlDelete)
        .then(affectedRows => {
            if (affectedRows > 0) return res.status(204).send();
            return deleteReview(sqlDeleteVinyl);
        })
        .then(affectedRows => {
            if (affectedRows > 0) return res.status(204).send();
            if (!res.headersSent) handleNotFound(res);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "DBError", message: "Delete failed: " + err.message });
        });
});
router.get("/reviews/:id", (req, res) => {
    res.status(501).json({ error: "NotImplemented", message: "GET by ID is complex with split tables." });
});


export default router;
