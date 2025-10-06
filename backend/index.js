import express from "express";
import mysql from "mysql2";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());


app.use("/uploads", express.static("uploads"));

const db = mysql.createConnection({
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

app.get("/api/vinyls", (req, res) => {
  db.query("SELECT * FROM Vinyls", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get("/api/cassettes", (req, res) => {
  db.query("SELECT * FROM Cassettes", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get("/", (req, res) => {
  res.send("API працює! Використовуй /vinyls або /cassettes");
});

app.listen(5000, () => {
  console.log("Сервер запущено на http://localhost:5000");
});
