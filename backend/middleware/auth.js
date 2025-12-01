import jwt from 'jsonwebtoken';
import { db } from '../index.js'; 

const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY_FOR_JWT'; 

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        return res.status(401).json({ message: 'Потрібна автентифікація (токен відсутній).' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Недійсний або прострочений токен.' });
        }
    
        req.user = user; 
        next(); // Продовжуємо виконання запиту
    });
};

export const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next(); // Дозволяємо
    } else {
        res.status(403).json({ message: 'Доступ заборонено: Потрібні права Адміністратора.' });
    }
};

export const authorizeUser = (req, res, next) => {
    // Ця функція викликається ПІСЛЯ authenticateToken
    if (req.user && (req.user.role === 'User' || req.user.role === 'Admin')) {
        next(); 
    } else {
        res.status(403).json({ message: 'Доступ заборонено: Потрібно бути залогіненим користувачем.' });
    }
};

export const isReviewAuthor = async (req, res, next) => {
    const reviewId = req.params.id;
    
    if (req.user && req.user.role === 'Admin') return next();
    
    const userIdFromToken = req.user.id; 
    
    const findReviewSql = `
        SELECT userId FROM reviewsvinyls WHERE ID = ? 
        UNION ALL 
        SELECT userId FROM reviewscassettes WHERE ID = ?
    `;
    
    try {
        const [results] = await db.promise().query(findReviewSql, [reviewId, reviewId]); 
        const review = results[0];
        
        if (!review) return res.status(404).json({ message: 'Коментар не знайдено.' });

        // Тут потрібна міграція, щоб review.userId був INT, а не VARCHAR
        if (review.userId === userIdFromToken) {
            next(); 
        } else {
            res.status(403).json({ message: 'Forbidden: Ви можете редагувати лише власні коментарі.' });
        }
    } catch (err) {
        console.error("DB Error in isReviewAuthor:", err);
        res.status(500).json({ message: 'Внутрішня помилка сервера при перевірці авторства.' });
    }
};