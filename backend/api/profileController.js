import express from 'express';
// Імпортуємо функцію захисту (middleware)
import { authenticateToken as protect } from '../middleware/auth.js'; 
import { db } from '../index.js';

// === 1. НОВІ ІМПОРТИ ===
// Імпортуємо наш готовий middleware для завантаження файлів
import upload from '../middleware/uploadMiddleware.js'; 
// fs (File System) та path потрібні для видалення старих файлів
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// === 2. НАЛАШТУВАННЯ __DIRNAME (для ES Modules) ===
// Потрібно, щоб знайти папку /uploads для видалення
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ------------------------------------------------------------------
// 1. [GET /api/profile] - Отримати дані профілю (БЕЗ ЗМІН)
// ------------------------------------------------------------------
router.get('/', protect, async (req, res) => {
    // ... (ваш код без змін) ...
    const userId = req.user.id; 
    const rid = req.rid ? `[${req.rid}] ` : ''; 

    try {
        const [users] = await db.promise().query(
            'SELECT user_id, username, email, profile_photo_url, registration_date, role FROM Users WHERE user_id = ?', 
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

// ------------------------------------------------------------------
// 2. [PUT /api/profile] - Оновити логін/ім'я (БЕЗ ЗМІН)
// ------------------------------------------------------------------
router.put('/', protect, async (req, res) => {
    // ... (ваш код без змін) ...
    const userId = req.user.id;
    const { username } = req.body;
    const rid = req.rid ? `[${req.rid}] ` : ''; 
    
    if (!username || username.trim().length < 3) {
        return res.status(400).json({ message: "Ім'я користувача має бути не менше 3 символів." });
    }
    try {
        const [existingUsers] = await db.promise().query(
            'SELECT user_id FROM Users WHERE username = ? AND user_id != ?', 
            [username, userId]
        );
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "Користувач з таким іменем вже існує." });
        }
        await db.promise().query(
            'UPDATE Users SET username = ? WHERE user_id = ?',
            [username, userId]
        );
        res.status(200).json({ message: 'Логін успішно оновлено!', username });
    } catch (error) {
        console.error(`${rid}Помилка оновлення профілю:`, error);
        res.status(500).json({ message: "Помилка сервера під час оновлення логіну." });
    }
});

// ------------------------------------------------------------------
// 3. [PUT /api/profile/photo] - НОВИЙ РОУТ ДЛЯ ЗМІНИ ФОТО
// ------------------------------------------------------------------
router.put(
    '/photo', // Новий ендпоінт
    protect, // Захищаємо, щоб знати, ЯКОМУ юзеру міняти фото
    upload.single('profilePhoto'), // Використовуємо multer
    async (req, res) => {
        
    const rid = req.rid ? `[${req.rid}] ` : ''; 
        
    // 1. Перевіряємо, чи файл завантажено
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не було завантажено.' });
    }

    const userId = req.user.id;
    const newPhotoName = req.file.filename; // Нове унікальне ім'я файлу

    try {
        // 2. (Важливо) Отримуємо ім'я старого файлу, щоб видалити його
        const [users] = await db.promise().query(
            'SELECT profile_photo_url FROM Users WHERE user_id = ?', 
            [userId]
        );
        const oldPhotoName = users[0]?.profile_photo_url;

        // 3. Оновлюємо базу даних новим іменем файлу
        await db.promise().query(
            'UPDATE Users SET profile_photo_url = ? WHERE user_id = ?',
            [newPhotoName, userId]
        );

        // 4. (Важливо) Видаляємо старий файл з диску, щоб не накопичувати сміття
        if (oldPhotoName) {
            // Шлях до старого файлу (backend/uploads/filename.jpg)
            const oldPath = path.join(__dirname, '..', 'uploads', oldPhotoName);
            
            fs.unlink(oldPath, (err) => {
                if (err) {
                    // Просто логуємо помилку, але не зупиняємо процес
                    console.error(`${rid}Не вдалося видалити старий файл: ${oldPath}`, err);
                }
            });
        }
        
        // 5. Відправляємо успішну відповідь з новим іменем файлу
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