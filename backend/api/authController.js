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
        const [existingUsers] = await db.promise().query(
            'SELECT user_id FROM Users WHERE username = ? OR email = ?', 
            [username, email]
        );

        if (existingUsers.length > 0) {
            const isUsernameTaken = existingUsers.some(user => user.username === username);
            const isEmailTaken = existingUsers.some(user => user.email === email);

            if (isUsernameTaken) {
                return res.status(409).json({ message: "Користувач з таким іменем вже існує." });
            }
            if (isEmailTaken) {
                 return res.status(409).json({ message: "Користувач з таким email вже існує." });
            }
        }

        const salt = await bcrypt.genSalt(10); 
        const passwordHash = await bcrypt.hash(password, salt);

        const [result] = await db.promise().query(
            'INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );

        // --- 6. Відповідь ---
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
        // 1. Знайти користувача за email
        const [users] = await db.promise().query(
            'SELECT user_id, password_hash, username FROM Users WHERE email = ?', 
            [email]
        );

        const user = users[0];

        // Перевірка існування користувача
        if (!user) {
            return res.status(401).json({ message: "Невірний email або пароль." });
        }

        // 2. Порівняння хешованого пароля
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Невірний email або пароль." });
        }

        // 3. Генерація JWT токена
        const token = jwt.sign(
            { id: user.user_id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' } // Токен дійсний 1 годину
        );

        // 4. Успішна відповідь: повертаємо токен та базові дані користувача
        res.status(200).json({
            message: "Вхід успішний.",
            token,
            user: {
                id: user.user_id,
                username: user.username,
            }
        });

    } catch (error) {
        console.error(`[${req.rid}] Помилка входу:`, error);
        res.status(500).json({ message: "Внутрішня помилка сервера." });
    }
});

export default router;