import express from "express";
import mysql from "mysql2";
import cors from "cors";
import { v4 as uuidv4 } from 'uuid';

import productController from "./api/productController.js";
import reviewController from "./api/reviewController.js";
import authController from "./api/authController.js";
import profileController from "./api/profileController.js"; 

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(cors());
app.use(express.json());
app.use(cors({
    exposedHeaders: ['Retry-After', 'X-Request-Id'],
}));

const dbUrl = process.env.NODE_ENV === 'test' 
    ? process.env.DB_URL 
    : "mysql://stasnya:Aa20061095!@26.210.121.124:3306/music_catalog";

export const db = mysql.createPool({
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    uri: dbUrl 
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

app.use("/api", authController); 
app.use("/api/profile", profileController); 
app.use("/api", productController); 
app.use("/api", reviewController);
app.use("/uploads", express.static("uploads")); 

app.get("/", (req, res) => {
    res.send("API працює! Маршрути підключено.");
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Сервер запущено на http://localhost:${PORT}`);
    });
}