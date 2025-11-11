import supertest from 'supertest';
import { app, db } from '../index.js'; 

const request = supertest(app);


const API_PATH = '/api/reviews';

const jwt = (await import('jsonwebtoken')).default; // Динамічний імпорт для ESM

describe('Review API Integration Tests', () => {

  const correctReviewData = {
    productType: "vinyl",
    productId: "v-001",
    text: "Це чудовий продукт для тестування!",
    rating: 5
  };
  
  const invalidDataEmptyText = {
    productType: "vinyl",
    productId: "v-001",
    text: "",
    rating: 1
  };
  const TEST_USER_TOKEN = jwt.sign(
    { username: 'test_user', role: 'USER' },
    process.env.JWT_SECRET || 'test_secret_key',
    { expiresIn: '1h' }
  );
  beforeAll(async () => {
    try {
      await db.promise().query('TRUNCATE TABLE reviews');
    } catch (e) {
      console.warn("Could not truncate 'reviews' table. Maybe it doesn't exist or DB is down?", e.message);
    }
  });

  test("should successfully create a review with valid data", async () => {
    const response = await request.post(API_PATH)
      .set('Authorization', `Bearer ${TEST_USER_TOKEN}`)
      .send(correctReviewData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.text).toBe(correctReviewData.text);
    expect(response.body.user).toBe('test_user'); 
  });

  test("should return 400 for empty review text", async () => {
    const response = await request.post(API_PATH)
      .set('Authorization', `Bearer ${TEST_USER_TOKEN}`)
      .send(invalidDataEmptyText);

    expect(response.status).toBe(400); 
  });
  
  test("should return 401 for missing auth token", async () => {
    const response = await request.post(API_PATH)
      .send(correctReviewData);

    expect(response.status).toBe(401);
  });

  test("should return a list of reviews", async () => {
    const response = await request.get(API_PATH);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});