import express from "express";
import { db } from "../index.js";
import { authenticateToken, authorizeAdmin } from "../middleware/authMiddleware.js"; 

const router = express.Router();

const idempotencyStore = new Map();

const sendError = (res, req, message, httpStatus = 500, code = null, details = []) => {
    console.error(`[${req.rid || 'API'}] Error: ${message}`, details);
    res.status(httpStatus).json({ error: message, code, details, requestId: req.rid || null });
};

router.post("/reviews", authenticateToken, (req, res) => {
    const key = req.get("Idempotency-Key");
    const authenticatedUserId = req.user.id;

    if (key) {
        if (idempotencyStore.has(key)) {
            const stored = idempotencyStore.get(key);
            return res.status(201).json({ ...stored, requestId: req.rid });
        }
    }

    const { productType, productId, text, comment, rating } = req.body;
    const finalComment = text || comment;
    
    if (!productType || !productId || !finalComment || finalComment.length < 3) {
        return sendError(res, req, "Validation error: Missing fields or comment too short", 400, "VALIDATION_ERROR");
    }

    const tableName = productType === 'vinyl' ? "ReviewsVinyls" : "ReviewsCassettes";
    const productField = productType === 'vinyl' ? "vinyl_id" : "cassette_id";
    
    const sql = `
        INSERT INTO ${tableName} (${productField}, userId, rating, comment, date, productType)
        VALUES (?, ?, ?, ?, NOW(), ?)`;

    const params = [
        productId, 
        authenticatedUserId,
        rating || 5, 
        finalComment, 
        productType
    ];

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendError(res, req, "DB Error while inserting review", 500, "DB_INSERT_FAILED");
        }
        
        const newReview = {
            ID: result.insertId,
            userId: authenticatedUserId,
            rating: rating || 5, 
            comment: finalComment, 
            product_type: productType,
            productId: productId
        };
        
        if (key) {
            idempotencyStore.set(key, newReview);
        }
        
        res.status(201).json({ ...newReview, requestId: req.rid });
    });
});

router.get("/reviews", (req, res) => {
    const { productType, productId } = req.query;

    if (productType && productId) {
        const tableName = productType === 'vinyl' ? "ReviewsVinyls" : "ReviewsCassettes";
        const productField = productType === 'vinyl' ? "vinyl_id" : "cassette_id";
        
        const sql = `
            SELECT 
                R.ID, R.userId, R.rating, R.comment, R.date, 
                '${productType}' as product_type, ${productField} as productId,
                U.username as username
            FROM ${tableName} R
            JOIN Users U ON R.userId = U.user_id
            WHERE R.${productField} = ?`;

        db.query(sql, [productId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "DBError", message: "Query failed: " + err.message });
            }
            res.status(200).json(results);
        });

    } else {
        const sqlCassettes = `
            SELECT R.ID, R.userId, R.rating, R.comment, R.date, 'cassette' as product_type, R.cassette_id as productId, U.username as username
            FROM ReviewsCassettes R JOIN Users U ON R.userId = U.user_id`;

        const sqlVinyls = `
            SELECT R.ID, R.userId, R.rating, R.comment, R.date, 'vinyl' as product_type, R.vinyl_id as productId, U.username as username
            FROM ReviewsVinyls R JOIN Users U ON R.userId = U.user_id`;
        
        db.query(sqlCassettes, (err, cassResults) => {
            if (err) return res.status(500).json({ error: "DBError", message: "Cassettes query failed: " + err.message });
            
            db.query(sqlVinyls, (err2, vinylResults) => {
                if (err2) return res.status(500).json({ error: "DBError", message: "Vinyls query failed: " + err2.message });
                res.status(200).json([...cassResults, ...vinylResults]);
            });
        });
    }
});

router.get("/reviews/:id", (req, res) => {
    res.status(501).json({ error: "NotImplemented", message: "GET by ID is complex with split tables." });
});

router.get("/health", (req, res) => res.json({ status: "ok" }));

router.put("/reviews/:id", authenticateToken, async (req, res) => {
    const reviewId = req.params.id;
    const userIdFromToken = req.user.id; 
    const userRole = req.user.role;
    const { rating, comment } = req.body; 

    if (userRole !== 'Admin') {
        const findReviewSql = `
            SELECT userId FROM ReviewsVinyls WHERE ID = ? 
            UNION ALL 
            SELECT userId FROM ReviewsCassettes WHERE ID = ?
        `;

        try {
            const [results] = await db.promise().query(findReviewSql, [reviewId, reviewId]);
            const review = results[0];

            if (!review) {
                 return res.status(404).json({ message: 'Коментар не знайдено.' });
            }
            if (String(review.userId) !== String(userIdFromToken)) {
                return res.status(403).json({ message: 'Forbidden: Ви можете редагувати лише власні коментарі.' });
            }
        } catch(e) {
             return sendError(res, req, "DB Error during author check", 500, "AUTHOR_CHECK_FAILED");
        }
    }
    
    if (comment !== undefined && comment.trim().length < 3) {
        return sendError(res, req, "Comment must be at least 3 characters.", 400, "INVALID_COMMENT_LENGTH");
    }
    if (rating === undefined && comment === undefined) {
        return sendError(res, req, "No data provided for update.", 400, "NO_DATA_PROVIDED");
    }

    const updateReview = (sql) => {
         return new Promise((resolve, reject) => {
             db.query(sql, [rating, comment, reviewId], (err, result) => {
                 if (err) return reject(err);
                 resolve(result.affectedRows);
             });
         });
    };

    const sqlUpdateCassette = "UPDATE ReviewsCassettes SET rating = ?, comment = ? WHERE ID = ?";
    const sqlUpdateVinyl = "UPDATE ReviewsVinyls SET rating = ?, comment = ? WHERE ID = ?";

    updateReview(sqlUpdateCassette)
        .then(affectedRows => {
            if (affectedRows > 0) return res.status(200).json({ message: "Відгук оновлено" });
            return updateReview(sqlUpdateVinyl);
        })
        .then(affectedRows => {
            if (affectedRows > 0) return res.status(200).json({ message: "Відгук оновлено" });
            if (!res.headersSent) res.status(404).json({ message: 'Review not found.' });
        })
        .catch(err => {
            sendError(res, req, "Update failed: " + err.message, 500, "DB_UPDATE_FAILED");
        });
});

router.delete("/reviews/:id", authenticateToken, async (req, res) => { 
    const reviewId = req.params.id;
    const userIdFromToken = req.user.id;
    const userRole = req.user.role;
    
    if (userRole !== 'Admin') { 
        
        const findReviewSql = `
            SELECT userId FROM ReviewsVinyls WHERE ID = ? 
            UNION ALL 
            SELECT userId FROM ReviewsCassettes WHERE ID = ?
        `;
        
        try {
            const [results] = await db.promise().query(findReviewSql, [reviewId, reviewId]);
            const review = results[0];

            if (review && String(review.userId) !== String(userIdFromToken)) { 
                return res.status(403).json({ message: 'Forbidden: Ви можете видаляти лише власні коментарі.' });
            }

        } catch(e) {
             return sendError(res, req, "DB Error during author check", 500, "AUTHOR_CHECK_FAILED");
        }
    }
    
    const deleteReview = (sql) => {
         return new Promise((resolve, reject) => {
             db.query(sql, [reviewId], (err, result) => {
                 if (err) return reject(err);
                 resolve(result.affectedRows);
             });
         });
    };

    const sqlDeleteCassette = "DELETE FROM ReviewsCassettes WHERE ID = ?";
    const sqlDeleteVinyl = "DELETE FROM ReviewsVinyls WHERE ID = ?";

    deleteReview(sqlDeleteCassette)
        .then(affectedRows => {
            if (affectedRows > 0) return res.status(204).send();
            return deleteReview(sqlDeleteVinyl);
        })
        .then(affectedRows => {
            if (affectedRows > 0) return res.status(204).send();
            if (!res.headersSent) res.status(404).json({ message: 'Review not found.' });
        })
        .catch(err => {
            sendError(res, req, "Delete failed: " + err.message, 500, "DB_DELETE_FAILED");
        });
});

export default router;