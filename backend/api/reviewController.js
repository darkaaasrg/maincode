import express from "express";
import { db } from "../index.js";
const router = express.Router();

const idempotencyStore = new Map();

const sendError = (res, req, message, httpStatus = 500, code = null, details = []) => {
    console.error(`[${req.rid}] Error: ${message}`);
    res.status(httpStatus).json({ error: message, code, details, requestId: req.rid });
};

router.post("/reviews", (req, res) => {
    const key = req.get("Idempotency-Key");
    if (!key) {
        return sendError(res, req, "idempotency_key_required", 400);
    }
    if (idempotencyStore.has(key)) {
        const stored = idempotencyStore.get(key);
        return res.status(201).json({ ...stored, requestId: req.rid });
    }

    const { user, productType, productId, comment } = req.body;
    if (!user || !productType || !productId || !comment || comment.length < 3) {
        return sendError(res, req, "validation_error", 400, "EMPTY_REVIEW_OR_MISSING_FIELD");
    }

    const tableName = productType === 'vinyl' ? "ReviewsVinyls" : "ReviewsCassettes";
    const productField = productType === 'vinyl' ? "vinyl_id" : "cassette_id";
    const sql = `INSERT INTO ${tableName} (${productField}, userId, rating, comment, date, productType) VALUES (?, ?, ?, ?, NOW(), ?)`;
    const params = [req.body.productId, req.body.user, req.body.rating || 5, req.body.comment, req.body.productType];

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendError(res, req, "db_error", 500);
        }
        const newReview = {
            ID: result.insertId,
            userId: req.body.user,
            rating: req.body.rating || 5,
            comment: req.body.comment,
            product_type: req.body.productType,
            productId: req.body.productId
        };
        idempotencyStore.set(key, newReview);
        res.status(201).json({ ...newReview, requestId: req.rid });
    });
});

router.get("/health", (req, res) => res.json({ status: "ok" }));

router.get("/reviews", (req, res) => {
    const { productType, productId } = req.query;

    if (productType && productId) {
        const tableName = productType === 'vinyl' ? "ReviewsVinyls" : "ReviewsCassettes";
        const productField = productType === 'vinyl' ? "vinyl_id" : "cassette_id";
        
        const sql = `
            SELECT ID, userId, rating, comment, date, '${productType}' as product_type, ${productField} as productId 
            FROM ${tableName} 
            WHERE ${productField} = ?`;

        db.query(sql, [productId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "DBError", message: "Query failed: " + err.message });
            }
            res.status(200).json(results);
        });

    } else {
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
    VALUES (?, ?, ?, ?, NOW(), ?)`;

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

    // --- 👇 ДОДАНО ВАЛІДАЦІЮ ---
    // Перевіряємо, чи передано поле коментаря, і якщо так, то чи валідне воно
    if (comment !== undefined && comment.trim().length < 3) {
        return sendError(res, req, "validation_error", 400, "INVALID_COMMENT_LENGTH", [
            { field: "comment", message: "Review comment must be at least 3 characters." }
        ]);
    }
    // -------------------------

    if (rating === undefined && comment === undefined) {
       return sendError(res, req, "bad_request", 400, "NO_DATA_PROVIDED");
    }

    const fieldsToUpdate = [];
    const values = [];

    if (rating !== undefined) {
        fieldsToUpdate.push("rating = ?");
        values.push(rating);
    }
    if (comment !== undefined) {
        fieldsToUpdate.push("comment = ?");
        values.push(comment);
    }
    values.push(reviewId);

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
