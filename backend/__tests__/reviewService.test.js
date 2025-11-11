// --- ПОВНІСТЮ ЗАМІНИ СВІЙ ФАЙЛ ТЕСТУ ЦИМ КОДОМ ---

import supertest from 'supertest';

// 'app' (default) та 'db' (named) з твого index.js
import app, { db } from '../index.js'; 

const request = supertest(app);

// Твій index.js підключає reviewController.js до '/api'
// Твій reviewController.js слухає '/reviews'
// Отже, повний шлях = '/api/reviews'
const API_PATH = '/api/reviews';

// 'await import' на найвищому рівні
const jwt = (await import('jsonwebtoken')).default; 

describe('Review API Integration Tests (Real Controller)', () => {

  // Дані для POST-запиту
  const correctReviewData = {
    productType: "vinyl", // Контролер це очікує
    productId: "v-001",   // Контролер це очікує
    text: "Це чудовий продукт для тестування!", // Контролер перетворить це на 'finalComment'
    rating: 5
  };
  
  // Невалідні дані (текст занадто короткий)
  const invalidDataEmptyText = {
    productType: "vinyl",
    productId: "v-001",
    text: "a", // <--- твій код перевіряє 'length < 3'
    rating: 1
  };
  
  // Створюємо тестового юзера
  const TEST_USER_ID = 'test-user-id-123'; // <--- Твій код очікує req.user.id
  
  const TEST_USER_TOKEN = jwt.sign(
    { 
      id: TEST_USER_ID, // <--- КЛЮЧОВА ЗМІНА
      username: 'test_user', 
      role: 'USER' 
    },
    process.env.JWT_SECRET || 'test_secret_key', // Береться з CI env
    { expiresIn: '1h' }
  );

  // Очищуємо ОБИДВІ таблиці відгуків перед тестами
  beforeAll(async () => {
    try {
      // Використовуємо твої реальні назви таблиць
      await db.promise().query('TRUNCATE TABLE ReviewsVinyls');
      await db.promise().query('TRUNCATE TABLE ReviewsCassettes');
    } catch (e) {
      console.warn(`Could not truncate tables. (Maybe they don't exist in test_db?) Error: ${e.message}`);
    }
  });

  // a. Успішний випадок (Створення)
  test("should successfully create a review with valid data", async () => {
    const response = await request.post(API_PATH)
      .set('Authorization', `Bearer ${TEST_USER_TOKEN}`) 
      .send(correctReviewData); 
      
    // 1. Перевіряємо статус
    expect(response.status).toBe(201);
    // 2. Перевіряємо ID (твій код повертає 'ID')
    expect(response.body).toHaveProperty('ID');
    // 3. Перевіряємо 'comment' (твій код повертає 'comment')
    expect(response.body.comment).toBe(correctReviewData.text);
    // 4. Перевіряємо 'userId' (твій код повертає 'userId')
    expect(String(response.body.userId)).toBe(String(TEST_USER_ID)); 
  });

  // b. Помилковий випадок (Короткий текст)
  test("should return 400 for review text < 3 chars", async () => {
    const response = await request.post(API_PATH)
      .set('Authorization', `Bearer ${TEST_USER_TOKEN}`)
      .send(invalidDataEmptyText); // Надсилаємо дані з 'text: "a"'

    // Твій код перевіряє 'finalComment.length < 3' і повертає 400
    expect(response.status).toBe(400); 
  });
  
  // c. Помилковий випадок (Без токена)
  test("should return 401 for missing auth token", async () => {
    const response = await request.post(API_PATH)
      .send(correctReviewData); // НЕ надсилаємо токен

    // Твій middleware 'authenticateToken' поверне 401
    expect(response.status).toBe(401);
  });

  // d. Успішний випадок (Отримання)
  test("should return a list of reviews (from both tables)", async () => {
    const response = await request.get(API_PATH);
    
    // Твій код об'єднує результати з 'ReviewsCassettes' та 'ReviewsVinyls'
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Ми очікуємо 1 запис з нашого 'create' тесту
    expect(response.body.length).toBe(1); 
  });

  // Закриваємо з'єднання з БД після всіх тестів
  afterAll(async () => {
    await db.promise().end();
  });
});