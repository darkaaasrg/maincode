import express from "express";
import mysql from "mysql2";
import cors from "cors";
import { v4 as uuidv4 } from 'uuid';
import productController from "./api/productController.js";
import reviewController from "./api/reviewController.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(cors({
    exposedHeaders: ['Retry-After', 'X-Request-Id'],
}));
app.use(express.json());

export const db = mysql.createPool({
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    host: "26.210.121.124",
    user: "stasnya",
    password: "Aa20061095!",
    database: "music_catalog"
});

const rate = new Map();
const WINDOW_MS = 10_000, MAX_REQ = 5;
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

// 3. Middleware для імітації збоїв та затримок (для тестування)
app.use(async (req, res, next) => {
    // Ігноруємо для GET запитів, щоб не сповільнювати завантаження даних
    if (req.method === 'GET') {
        return next();
    }
    const r = Math.random();
    // 15% шанс на довгу затримку
    if (r < 0.15) await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    // 20% шанс на помилку 5xx
    if (r > 0.80) {
        const err = Math.random() < 0.5 ? "unavailable" : "unexpected";
        const code = err === "unavailable" ? 503 : 500;
        return res.status(code).json({ error: err, requestId: req.rid });
    }
    next();
});

app.use("/api", productController); 
app.use("/api", reviewController);
app.use("/uploads", express.static("uploads")); 
app.get("/", (req, res) => {
    res.send("API працює! Маршрути підключено.");
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});