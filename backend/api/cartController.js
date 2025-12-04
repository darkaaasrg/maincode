import express from 'express';
import { db } from '../index.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT 
            c.cart_id, 
            c.product_id, 
            c.product_type, 
            c.quantity,
            COALESCE(v.Title, cas.Title) as Title,
            COALESCE(v.Price, cas.Price) as Price,
            COALESCE(v.Photo, cas.Photo) as Photo,
            COALESCE(v.Artist, cas.Artist) as Artist
        FROM Cart c
        LEFT JOIN vinyls v ON c.product_type = 'vinyl' AND c.product_id = v.ID
        LEFT JOIN cassettes cas ON c.product_type = 'cassette' AND c.product_id = cas.ID
        WHERE c.user_id = ?
    `;

    try {
        const [items] = await db.promise().query(sql, [userId]);
        res.json(items);
    } catch (err) {
        console.error("Помилка отримання кошика (GET /api/cart):", err);
        res.status(500).json({ message: "Помилка сервера при завантаженні кошика" });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { productId, productType } = req.body;

    if (!productId || !['vinyl', 'cassette'].includes(productType)) {
        return res.status(400).json({ message: "Невірні дані товару" });
    }

    try {
        const [existing] = await db.promise().query(
            'SELECT cart_id, quantity FROM Cart WHERE user_id = ? AND product_id = ? AND product_type = ?',
            [userId, productId, productType]
        );

        if (existing.length > 0) {
            await db.promise().query(
                'UPDATE Cart SET quantity = quantity + 1 WHERE cart_id = ?',
                [existing[0].cart_id]
            );
            res.json({ message: "Кількість збільшено" });
        } else {
            await db.promise().query(
                'INSERT INTO Cart (user_id, product_id, product_type, quantity) VALUES (?, ?, ?, 1)',
                [userId, productId, productType]
            );
            res.status(201).json({ message: "Додано в кошик" });
        }
    } catch (err) {
        console.error("Помилка додавання (POST /api/cart):", err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const cartId = req.params.id;

    try {
        await db.promise().query(
            'DELETE FROM Cart WHERE cart_id = ? AND user_id = ?',
            [cartId, userId]
        );
        res.json({ message: "Видалено" });
    } catch (err) {
        console.error("Помилка видалення:", err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

export default router;