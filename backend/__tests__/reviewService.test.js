// --- ПОВНІСТЮ ЗАМІНИ СВІЙ ФАЙЛ ТЕСТУ ЦИМ КОДОМ ---

import supertest from 'supertest';
import app, { db } from '../index.js'; 
const request = supertest(app);

const API_PATH = '/api/reviews';
const jwt = (await import('jsonwebtoken')).default; 

describe('Review API Integration Tests (Real Controller)', () => {

  const correctReviewData = {
    productType: "vinyl", 
    productId: "v-001",   
    text: "Це чудовий продукт для тестування!", 
    rating: 5
  };
  
  const invalidDataEmptyText = {
    productType: "vinyl",
    productId: "v-001",
    text: "a", 
    rating: 1
  };
  
  const TEST_USER_ID = 'test-user-id-123'; 
  
  const TEST_USER_TOKEN = jwt.sign(
    { id: TEST_USER_ID, username: 'test_user', role: 'USER' },
    process.env.JWT_SECRET || 'test_secret_key', 
    { expiresIn: '1h' }
  );

  // --- КЛЮЧОВЕ ВИПРАВЛЕННЯ ТУТ: СТВОРЮЄМО ТАБЛИЦІ ---
  beforeAll(async () => {
    try {
      // Створюємо мінімальну Users таблицю
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS Users (
          user_id VARCHAR(255) PRIMARY KEY NOT NULL,
          username VARCHAR(255),
          password VARCHAR(255)
        );
      `);
      
      // Створюємо тестового юзера
      await db.promise().query(
        'INSERT IGNORE INTO Users (user_id, username) VALUES (?, ?)',
        [TEST_USER_ID, 'test_user']
      );

      // Створюємо таблиці відгуків
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS ReviewsVinyls (
          ID INT AUTO_INCREMENT PRIMARY KEY,
          vinyl_id VARCHAR(255),
          userId VARCHAR(255),
          rating INT,
          comment TEXT,
          date DATETIME,
          productType VARCHAR(50)
        );
      `);
      
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS ReviewsCassettes (
          ID INT AUTO_INCREMENT PRIMARY KEY,
          cassette_id VARCHAR(255),
          userId VARCHAR(255),
          rating INT,
          comment TEXT,
          date DATETIME,
          productType VARCHAR(50)
        );
      `);
      
    } catch (e) {
      console.error(`!!!! FAILED TO SETUP DB !!!! Error: ${e.message}`);
      // Кидаємо помилку, щоб тести не запускались
      throw e;
    }
  });
  // --- КІНЕЦЬ ВИПРАВЛЕННЯ ---

  // a. Успішний випадок (Створення)
  test("should successfully create a review with valid data", async () => {
    const response = await request.post(API_PATH)
      .set('Authorization', `Bearer ${TEST_USER_TOKEN}`) 
      .send(correctReviewData); 
      
    // Тепер очікуємо 201, бо юзер існує
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('ID');
    expect(response.body.comment).toBe(correctReviewData.text);
    expect(String(response.body.userId)).toBe(String(TEST_USER_ID)); 
  });

  // b. Помилковий випадок (Короткий текст)
  test("should return 400 for review text < 3 chars", async () => {
    const response = await request.post(API_PATH)
      .set('Authorization', `Bearer ${TEST_USER_TOKEN}`)
      .send(invalidDataEmptyText); 

    // Тепер очікуємо 400
    expect(response.status).toBe(400); 
  });
  
  // c. Помилковий випадок (Без токена)
  test("should return 401 for missing auth token", async () => {
    const response = await request.post(API_PATH)
      .send(correctReviewData); 

    expect(response.status).toBe(401);
  });

  // d. Успішний випадок (Отримання)
  test("should return a list of reviews (from both tables)", async () => {
    const response = await request.get(API_PATH);
    
    // Тепер очікуємо 200, бо таблиці існують
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1); 
  });

  // Закриваємо з'єднання з БД після всіх тестів
  afterAll(async () => {
    await db.promise().end();
  });
});