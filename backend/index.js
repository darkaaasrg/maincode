import express from "express";
import mysql from "mysql2";
import { createConnection } from "mysql2/promise";
import cors from "cors";
import { v4 as uuidv4 } from 'uuid';

import productController from "./api/productController.js";
import reviewController from "./api/reviewController.js";
import authController from "./api/authController.js";
import profileController from "./api/profileController.js";
import cartController from "./api/cartController.js"; 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cors({
    exposedHeaders: ['Retry-After', 'X-Request-Id'],
}));


const DB_LOCAL = process.env.DB_URL_LOCAL || "mysql://vinilcasethub:1111111@10.10.10.73:3306/vinilcasethub";
const DB_EXTERNAL = process.env.DB_URL_EXTERNAL || "mysql://vinilcasethub:1111111@193.109.144.160:4391/vinilcasethub";

async function getWorkingDbUrl() {
    if (process.env.NODE_ENV === 'test') {
        return process.env.DB_URL || 'mysql://root:yourpassword@localhost:3306/test_db';
    }

    console.log("Перевірка підключення до бази даних...");

    try {
        console.log(`📡 Спроба (Local): ${DB_LOCAL.split('@')[1]}`);
        const conn = await createConnection({ uri: DB_LOCAL, connectTimeout: 3000 });
        await conn.end();
        console.log("Успішно: Використовується локальна мережа.");
        return DB_LOCAL;
    } catch (err) {
        console.warn(`Локальне підключення не вдалося: ${err.message}`);
    }

    try {
        console.log(`📡 Спроба (External): ${DB_EXTERNAL.split('@')[1]}`);
        const conn = await createConnection({ uri: DB_EXTERNAL, connectTimeout: 5000 });
        await conn.end();
        console.log("Успішно: Використовується зовнішня мережа.");
        return DB_EXTERNAL;
    } catch (err) {
        console.error(`Критична помилка: Не вдалося підключитися до жодної БД.`);
        process.exit(1); 
    }
}

const activeDbUrl = await getWorkingDbUrl();

export const db = mysql.createPool({
    uri: activeDbUrl,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: 10000
});

const rate = new Map();
const WINDOW_MS = 10_000, MAX_REQ = 50;
const now = () => Date.now();

app.use((req, res, next) => {
    const rid = req.get("X-Request-Id") || uuidv4();
    req.rid = rid;
    res.setHeader("X-Request-Id", rid);
    next();
});

app.use((req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local";
    const b = rate.get(ip) ?? { count: 0, ts: now() };
    const within = now() - b.ts < WINDOW_MS;
    const state = within ? { count: b.count + 1, ts: b.ts } : { count: 1, ts: now() };
    rate.set(ip, state);
    if (state.count > MAX_REQ) {
        res.setHeader("Retry-After", "2");
        return res.status(429).json({ error: "too_many_requests", requestId: req.rid });
    }
    next();
});

app.use("/api", authController);
app.use("/api/profile", profileController);
app.use("/api", productController);
app.use("/api", reviewController);
app.use("/api/cart", cartController);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.send(`API працює! Підключено до: ${activeDbUrl.includes('10.10.10.73') ? 'LOCAL' : 'EXTERNAL'} IP`);
});

app.get("/test-404", (req, res) => {
    return res.status(404).json({ error: "not_found_test" });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Сервер запущено на http://localhost:${PORT}`);
    });
}