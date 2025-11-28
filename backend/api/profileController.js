import express from 'express';
import { authenticateToken as protect } from '../middleware/auth.js'; 
import { db } from '../index.js';

import upload from '../middleware/uploadMiddleware.js'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/', protect, async (req, res) => {
    const userId = req.user.id; 
    const rid = req.rid ? `[${req.rid}] ` : ''; 

    try {
        const [users] = await db.promise().query(
            'SELECT user_id, username, email, profile_photo_url, registration_date, role FROM users WHERE user_id = ?', 
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: 'Користувача не знайдено.' });
        }
        res.status(200).json(users[0]);
    } catch (error) {
        console.error(`${rid}Помилка отримання профілю:`, error);
        res.status(500).json({ message: "Помилка сервера під час завантаження профілю." });
    }
});

router.put('/', protect, async (req, res) => {
    const userId = req.user.id;
    const { username } = req.body;
    const rid = req.rid ? `[${req.rid}] ` : ''; 
    
    if (!username || username.trim().length < 3) {
        return res.status(400).json({ message: "Ім'я користувача має бути не менше 3 символів." });
    }
    try {
        const [existingUsers] = await db.promise().query(
            'SELECT user_id FROM users WHERE username = ? AND user_id != ?', 
            [username, userId]
        );
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "Користувач з таким іменем вже існує." });
        }
        await db.promise().query(
            'UPDATE users SET username = ? WHERE user_id = ?',
            [username, userId]
        );
        res.status(200).json({ message: 'Логін успішно оновлено!', username });
    } catch (error) {
        console.error(`${rid}Помилка оновлення профілю:`, error);
        res.status(500).json({ message: "Помилка сервера під час оновлення логіну." });
    }
});

router.put(
    '/photo',
    protect,
    upload.single('profilePhoto'),
    async (req, res) => {
        
    const rid = req.rid ? `[${req.rid}] ` : ''; 
        
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не було завантажено.' });
    }

    const userId = req.user.id;
    const newPhotoName = req.file.filename;

    try {
        const [users] = await db.promise().query(
            'SELECT profile_photo_url FROM users WHERE user_id = ?', 
            [userId]
        );
        const oldPhotoName = users[0]?.profile_photo_url;

        await db.promise().query(
            'UPDATE users SET profile_photo_url = ? WHERE user_id = ?',
            [newPhotoName, userId]
        );

        if (oldPhotoName) {
            const oldPath = path.join(__dirname, '..', 'uploads', oldPhotoName);
            
            fs.unlink(oldPath, (err) => {
                if (err) {
                    console.error(`${rid}Не вдалося видалити старий файл: ${oldPath}`, err);
                }
            });
        }
        
        res.status(200).json({ 
            message: 'Фото профілю успішно оновлено!', 
            profile_photo_url: newPhotoName 
        });

    } catch (error) {
        console.error(`${rid}Помилка оновлення фото профілю:`, error);
        res.status(500).json({ message: "Помилка сервера під час оновлення фото." });
    }
});


export default router;