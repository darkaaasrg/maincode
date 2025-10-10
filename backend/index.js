// backend/index.js (КОРИГОВАНИЙ КОД)
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import productController from "./api/productController.js";
import reviewController from "./api/reviewController.js"; // <--- 💡 НОВИЙ ІМПОРТ

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- 🛠️ КОНФІГУРАЦІЯ MYSQL ---
// Використовуйте цю конфігурацію в контролерах, де потрібен доступ до БД
export const db = mysql.createConnection({ 
    host: "26.210.121.124",
    user: "stasnya",
    password: "Aa20061095!",
    database: "music_catalog"
});

db.connect(err => {
    if (err) {
        console.error("Помилка підключення до MySQL:", err);
    } else {
        console.log("Підключено до MySQL");
    }
});

// --- 🔗 ПІДКЛЮЧЕННЯ МАРШРУТІВ (РОУТЕРІВ) ---

// 1. Маршрути Продуктів (Cassettes, Vinyls, Health Check)
app.use("/api", productController); 

// 2. Маршрути Відгуків (Згідно з OpenAPI: /reviews та /reviews/:id)
app.use("/api", reviewController); // <--- 💡 ПІДКЛЮЧАЄМО REVIEW КОНТРОЛЕР

// 3. Роздача статичних файлів (uploads)
// Ми видаляємо імпорт 'path', 'fileURLToPath', '__filename', '__dirname',
// оскільки Express може працювати з "uploads" відносно кореня сервера
app.use("/uploads", express.static("uploads")); 

// --- ❌ ВИДАЛЕНО З INDEX.JS ---
/* Усі маршрути /api/cassettes, /api/vinyls, /api/cassettes/:id/reviews, 
    /api/vinyls/:id/reviews, /api/reviews/:id (PUT/DELETE) 
    БУЛИ ВИДАЛЕНІ з index.js. 
    Тепер вони повинні бути перенесені або в productController, або в reviewController.
*/

// --- 🌐 ЗАГАЛЬНИЙ МАРШРУТ ---
app.get("/", (req, res) => {
    res.send("API працює! Маршрути підключено.");
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});