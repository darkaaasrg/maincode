import express from 'express';
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';
import { db } from '../index.js'; 
const router = express.Router();

const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY_FOR_JWT';

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Будь ласка, заповніть усі поля." });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Пароль має бути не менше 6 символів." });
    }

    try {
        const [existingusers] = await db.promise().query(
            'SELECT user_id, username, email FROM users WHERE username = ? OR email = ?', 
            [username, email]
        );

        if (existingusers.length > 0) {
        }

        const salt = await bcrypt.genSalt(10); 
        const passwordHash = await bcrypt.hash(password, salt);

        const DEFAULT_ROLE = 'User';

        const [result] = await db.promise().query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHash, DEFAULT_ROLE] 
        );
       
        res.status(201).json({ 
            message: "Реєстрація успішна! Ласкаво просимо.",
            userId: result.insertId 
        });

    } catch (error) {
        console.error(`[${req.rid}] Помилка реєстрації:`, error);
        res.status(500).json({ message: "Внутрішня помилка сервера." });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body; 

    if (!email || !password) {
        return res.status(400).json({ message: "Будь ласка, введіть email та пароль." });
    }

    try {
        const [users] = await db.promise().query(
            'SELECT user_id, password_hash, username, role FROM users WHERE email = ?',
            [email]
        );

        const user = users[0];
        if (!user) {
            return res.status(401).json({ message: "Невірний email або пароль." });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Невірний email або пароль." });
        }
       const token = jwt.sign(
            { 
                id: user.user_id, 
                username: user.username,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Вхід успішний.",
            token,
            user: {
                id: user.user_id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error(`[${req.rid}] Помилка входу:`, error);
        res.status(500).json({ message: "Внутрішня помилка сервера." });
    }
});

export default router;